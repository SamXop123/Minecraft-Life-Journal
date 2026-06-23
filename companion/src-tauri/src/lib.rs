use std::sync::{Arc, Mutex};
use tauri::Emitter;

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
fn fetch_worlds(api_key: String, web_app_url: String) -> Result<serde_json::Value, String> {
    let client = reqwest::blocking::Client::new();
    let url = format!("{}/api/companion/worlds", web_app_url);
    
    let res = client.get(&url)
        .header("x-api-key", api_key)
        .send()
        .map_err(|e| e.to_string())?;
        
    let status = res.status();
    if status.is_success() {
        let val: serde_json::Value = res.json().map_err(|e| e.to_string())?;
        Ok(val)
    } else {
        Err(format!("Server returned error status: {}", status))
    }
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
        .plugin(tauri_plugin_opener::init())
        .manage(watcher_state)
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            fetch_worlds,
            start_watchers,
            stop_watchers
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
