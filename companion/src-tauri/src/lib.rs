use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, WindowEvent,
};

mod config;
mod log_watcher;
mod screenshot_watcher;
mod process_monitor;

use config::{AppConfig, load_config};
use log_watcher::LogWatcherManager;
use screenshot_watcher::{ScreenshotWatcherManager, SharedScreenshot};
use process_monitor::ProcessMonitorManager;

pub struct WatcherState {
    pub log_watcher: LogWatcherManager,
    pub screenshot_watcher: ScreenshotWatcherManager,
    pub process_monitor: ProcessMonitorManager,
    pub active: Mutex<bool>,
}

#[tauri::command]
fn get_config() -> Result<AppConfig, String> {
    Ok(load_config())
}

#[tauri::command]
fn save_config(config: AppConfig, state: tauri::State<'_, Arc<WatcherState>>, app_handle: tauri::AppHandle) -> Result<(), String> {
    config::save_config(&config)?;
    
    // If watchers are currently active, restart them to pick up new configurations
    let active = state.active.lock().unwrap();
    if *active {
        state.log_watcher.stop();
        state.screenshot_watcher.stop();
        state.process_monitor.stop();
        
        state.log_watcher.start(app_handle.clone());
        state.screenshot_watcher.start(app_handle.clone());
        state.process_monitor.start(app_handle.clone());
    }
    Ok(())
}

#[tauri::command]
async fn fetch_worlds(api_key: String, web_app_url: String) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(6))
        .build()
        .map_err(|e| e.to_string())?;

    let mut targets = vec![
        web_app_url.clone(),
        "https://mlj.app".to_string(),
        "https://minecraft-life-journal.vercel.app".to_string(),
        "http://localhost:3000".to_string(),
    ];
    targets.dedup();

    let mut last_err = String::new();
    for target in targets {
        if target.trim().is_empty() {
            continue;
        }
        let url = format!("{}/api/companion/worlds", target.trim_end_matches('/'));
        match client.get(&url).header("x-api-key", &api_key).send().await {
            Ok(res) => {
                let status = res.status();
                if status.is_success() {
                    let val: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
                    return Ok(val);
                } else {
                    last_err = format!("Server ({}) status: {}", target, status);
                }
            }
            Err(e) => {
                last_err = format!("Network error reaching ({}): {}", target, e);
            }
        }
    }

    Err(format!("Could not connect to MLJ servers. {}", last_err))
}

#[tauri::command]
fn start_watchers(state: tauri::State<'_, Arc<WatcherState>>, app_handle: tauri::AppHandle) -> Result<(), String> {
    let mut active = state.active.lock().unwrap();
    if !*active {
        *active = true;
        state.log_watcher.start(app_handle.clone());
        state.screenshot_watcher.start(app_handle.clone());
        state.process_monitor.start(app_handle.clone());
        let _ = app_handle.emit("sync-log-status", "Monitoring active.".to_string());
    }
    Ok(())
}

#[tauri::command]
fn stop_watchers(state: tauri::State<'_, Arc<WatcherState>>, app_handle: tauri::AppHandle) -> Result<(), String> {
    let mut active = state.active.lock().unwrap();
    if *active {
        *active = false;
        state.log_watcher.stop();
        state.screenshot_watcher.stop();
        state.process_monitor.stop();
        let _ = app_handle.emit("sync-log-status", "Monitoring stopped.".to_string());
    }
    Ok(())
}

#[tauri::command]
async fn submit_bug_report(title: String, description: String, contact: String) -> Result<(), String> {
    if title.trim().is_empty() || description.trim().is_empty() {
        return Err("Title and description are required.".to_string());
    }

    let config = load_config();
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(6))
        .build()
        .map_err(|e| e.to_string())?;

    let contact_text = if contact.trim().is_empty() { "Anonymous".to_string() } else { contact };

    let payload = serde_json::json!({
        "title": title,
        "description": description,
        "contact": contact_text,
        "worldName": config.selected_world_name,
        "appVersion": "v2.0.0",
        "os": std::env::consts::OS
    });

    let mut targets = vec![
        config.web_app_url.clone(),
        "https://mlj.app".to_string(),
        "https://minecraft-life-journal.vercel.app".to_string(),
        "http://localhost:3000".to_string(),
    ];
    targets.dedup();

    for target in targets {
        if target.trim().is_empty() {
            continue;
        }
        let api_url = format!("{}/api/companion/bug-report", target.trim_end_matches('/'));
        if let Ok(res) = client.post(&api_url).json(&payload).send().await {
            if res.status().is_success() {
                return Ok(());
            }
        }
    }

    Err("Failed to deliver bug report. Please verify network connection.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let recent_screenshot: SharedScreenshot = Arc::new(Mutex::new(None));
    
    let watcher_state = Arc::new(WatcherState {
        log_watcher: LogWatcherManager::new(recent_screenshot.clone()),
        screenshot_watcher: ScreenshotWatcherManager::new(recent_screenshot.clone()),
        process_monitor: ProcessMonitorManager::new(),
        active: Mutex::new(false),
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
                let _ = app.emit(
                    "sync-log-status",
                    "MLJ Companion is already running! Focusing window.".to_string(),
                );
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .manage(watcher_state)
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            fetch_worlds,
            start_watchers,
            stop_watchers,
            submit_bug_report
        ])
        .setup(|app| {
            let title_i = MenuItem::with_id(app, "title", "🎮  MLJ Companion v2.0.0", false, None::<&str>)?;
            let sep1 = PredefinedMenuItem::separator(app)?;
            let show_i = MenuItem::with_id(app, "show", "📌  Open Companion Window", true, None::<&str>)?;
            let web_i = MenuItem::with_id(app, "web", "🌐  Open Web Journal", true, None::<&str>)?;
            let sep2 = PredefinedMenuItem::separator(app)?;
            let quit_i = MenuItem::with_id(app, "quit", "❌  Quit MLJ Companion", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&title_i, &sep1, &show_i, &web_i, &sep2, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("MLJ Companion")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                    "web" => {
                        let config = load_config();
                        let url = if config.web_app_url.is_empty() {
                            "https://mlj.app".to_string()
                        } else {
                            config.web_app_url
                        };
                        let _ = tauri_plugin_opener::open_url(url, None::<&str>);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let config = load_config();
                if config.minimize_to_tray {
                    api.prevent_close();
                    let _ = window.hide();
                    let _ = window.app_handle().emit(
                        "sync-log-status",
                        "MLJ Companion is running in the system tray.".to_string(),
                    );
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
