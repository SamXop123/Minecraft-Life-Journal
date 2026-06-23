use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::{Duration, Instant};
use sysinfo::System;
use tauri::AppHandle;
use tauri::Emitter;
use crate::config::load_config;

pub struct ProcessMonitorManager {
    stop_flag: Arc<AtomicBool>,
}

impl ProcessMonitorManager {
    pub fn new() -> Self {
        Self {
            stop_flag: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn start(&self, app_handle: AppHandle) {
        self.stop_flag.store(false, Ordering::SeqCst);
        let stop_flag = self.stop_flag.clone();

        thread::spawn(move || {
            let mut sys = System::new_all();
            let mut is_minecraft_running = false;
            let mut session_start: Option<Instant> = None;
            let client = reqwest::blocking::Client::new();

            println!("Process monitor started.");

            while !stop_flag.load(Ordering::SeqCst) {
                // Refresh processes list
                sys.refresh_processes();

                // Check if any process name contains "javaw" or "minecraft"
                let is_running = sys.processes().values().any(|val| {
                    let name = val.name().to_lowercase();
                    name.contains("javaw") || name.contains("minecraft")
                });

                if is_running && !is_minecraft_running {
                    // Minecraft started!
                    is_minecraft_running = true;
                    session_start = Some(Instant::now());
                    println!("Minecraft launch detected!");
                    let _ = app_handle.emit("minecraft-status", true);

                    // Send start activity update (Mark played)
                    let config = load_config();
                    if !config.api_key.is_empty() && !config.selected_world_id.is_empty() {
                        let url = format!("{}/api/companion/activity", config.web_app_url);
                        let body = serde_json::json!({
                            "worldId": config.selected_world_id
                        });

                        match client.post(&url)
                            .header("x-api-key", &config.api_key)
                            .json(&body)
                            .send() {
                                Ok(res) => {
                                    if res.status().is_success() {
                                        let _ = app_handle.emit("sync-log-success", "Minecraft started - Session logged".to_string());
                                    }
                                }
                                Err(err) => {
                                    println!("Failed to send start activity: {}", err);
                                }
                            }
                    }
                } else if !is_running && is_minecraft_running {
                    // Minecraft closed!
                    is_minecraft_running = false;
                    println!("Minecraft closure detected!");
                    let _ = app_handle.emit("minecraft-status", false);

                    if let Some(start_time) = session_start {
                        let playtime_minutes = start_time.elapsed().as_secs() / 60;
                        println!("Played for {} minutes.", playtime_minutes);

                        let config = load_config();
                        if !config.api_key.is_empty() && !config.selected_world_id.is_empty() && playtime_minutes > 0 {
                            let url = format!("{}/api/companion/activity", config.web_app_url);
                            let body = serde_json::json!({
                                "worldId": config.selected_world_id,
                                "playtimeMinutes": playtime_minutes
                            });

                            match client.post(&url)
                                .header("x-api-key", &config.api_key)
                                .json(&body)
                                .send() {
                                    Ok(res) => {
                                        if res.status().is_success() {
                                            let _ = app_handle.emit("sync-log-success", format!("Minecraft closed - Playtime of {} minutes recorded", playtime_minutes));
                                        }
                                    }
                                    Err(err) => {
                                        println!("Failed to send session playtime: {}", err);
                                    }
                                }
                        }
                    }
                    session_start = None;
                }

                // Poll every 5 seconds
                thread::sleep(Duration::from_secs(5));
            }
            println!("Process monitor stopped.");
        });
    }

    pub fn stop(&self) {
        self.stop_flag.store(true, Ordering::SeqCst);
    }
}
