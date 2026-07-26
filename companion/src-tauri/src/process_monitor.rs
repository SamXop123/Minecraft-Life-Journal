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

fn send_playtime_update(client: &reqwest::blocking::Client, app_handle: &AppHandle, delta_minutes: u64, is_ongoing: bool) {
    if delta_minutes == 0 {
        return;
    }
    let config = load_config();
    if !config.api_key.is_empty() && !config.selected_world_id.is_empty() {
        let url = format!("{}/api/companion/activity", config.web_app_url);
        let body = serde_json::json!({
            "worldId": config.selected_world_id,
            "playtimeMinutes": delta_minutes
        });

        match client.post(&url)
            .header("x-api-key", &config.api_key)
            .json(&body)
            .send() {
                Ok(res) => {
                    if res.status().is_success() {
                        let status_msg = if is_ongoing {
                            format!("Live Playtime Sync: +{} min recorded", delta_minutes)
                        } else {
                            format!("Session end sync: +{} min recorded", delta_minutes)
                        };
                        let _ = app_handle.emit("sync-log-success", status_msg);
                    }
                }
                Err(err) => {
                    println!("Failed to send session playtime update: {}", err);
                }
            }
    }
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
            let mut last_synced_minutes: u64 = 0;
            let client = reqwest::blocking::Client::new();

            println!("Process monitor started.");

            while !stop_flag.load(Ordering::SeqCst) {
                // Refresh processes list
                sys.refresh_processes();

                // Check if any process name contains "javaw" or "minecraft", or matches "java"/"java.exe"
                let is_running = sys.processes().values().any(|val| {
                    let name = val.name().to_lowercase();
                    name.contains("javaw") || 
                    name.contains("minecraft") || 
                    name == "java" || 
                    name == "java.exe"
                });

                if is_running && !is_minecraft_running {
                    // Minecraft started!
                    is_minecraft_running = true;
                    session_start = Some(Instant::now());
                    last_synced_minutes = 0;
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
                                        let _ = app_handle.emit("sync-log-success", "Minecraft session started".to_string());
                                    }
                                }
                                Err(err) => {
                                    println!("Failed to send start activity: {}", err);
                                }
                            }
                    }
                } else if is_running && is_minecraft_running {
                    // Minecraft is actively running!
                    if let Some(start_time) = session_start {
                        let total_elapsed = start_time.elapsed().as_secs() / 60;
                        let delta = total_elapsed.saturating_sub(last_synced_minutes);
                        // Periodically sync every 2 minutes while playing so no playtime is lost
                        if delta >= 2 {
                            last_synced_minutes = total_elapsed;
                            send_playtime_update(&client, &app_handle, delta, true);
                        }
                    }
                } else if !is_running && is_minecraft_running {
                    // Minecraft closed!
                    is_minecraft_running = false;
                    println!("Minecraft closure detected!");
                    let _ = app_handle.emit("minecraft-status", false);

                    if let Some(start_time) = session_start {
                        let total_elapsed = start_time.elapsed().as_secs() / 60;
                        let delta = total_elapsed.saturating_sub(last_synced_minutes);
                        if delta > 0 {
                            send_playtime_update(&client, &app_handle, delta, false);
                        }
                    }
                    session_start = None;
                    last_synced_minutes = 0;
                }

                // Poll every 5 seconds
                thread::sleep(Duration::from_secs(5));
            }

            // If monitor thread is stopping while Minecraft was active, flush remaining delta
            if is_minecraft_running {
                if let Some(start_time) = session_start {
                    let total_elapsed = start_time.elapsed().as_secs() / 60;
                    let delta = total_elapsed.saturating_sub(last_synced_minutes);
                    if delta > 0 {
                        send_playtime_update(&client, &app_handle, delta, false);
                    }
                }
            }

            println!("Process monitor stopped.");
        });
    }

    pub fn stop(&self) {
        self.stop_flag.store(true, Ordering::SeqCst);
    }
}
