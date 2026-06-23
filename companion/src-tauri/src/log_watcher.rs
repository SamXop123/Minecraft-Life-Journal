use std::fs::File;
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::{Duration, Instant};
use tauri::AppHandle;
use tauri::Emitter;
use crate::config::load_config;
use crate::screenshot_watcher::SharedScreenshot;

pub struct LogWatcherManager {
    stop_flag: Arc<AtomicBool>,
    recent_screenshot: SharedScreenshot,
}

fn parse_command_text(trimmed_line: &str) -> Option<(String, String)> {
    if let Some(pos) = trimmed_line.find("#journal") {
        let text = trimmed_line[pos + 8..].trim().to_string();
        if !text.is_empty() {
            let title = if text.len() > 45 { format!("{}...", &text[..42]) } else { text.clone() };
            return Some((title, text));
        }
    }
    None
}

impl LogWatcherManager {
    pub fn new(recent_screenshot: SharedScreenshot) -> Self {
        Self {
            stop_flag: Arc::new(AtomicBool::new(false)),
            recent_screenshot,
        }
    }

    pub fn start(&self, app_handle: AppHandle) {
        self.stop_flag.store(false, Ordering::SeqCst);
        let stop_flag = self.stop_flag.clone();
        let recent_screenshot = self.recent_screenshot.clone();

        thread::spawn(move || {
            let config = load_config();
            if config.api_key.is_empty() || config.selected_world_id.is_empty() {
                return;
            }

            let log_path = Path::new(&config.minecraft_path).join("logs").join("latest.log");
            println!("Log watcher starting on path: {:?}", log_path);

            // Wait for file to exist
            while !log_path.exists() && !stop_flag.load(Ordering::SeqCst) {
                thread::sleep(Duration::from_secs(2));
            }

            if stop_flag.load(Ordering::SeqCst) {
                return;
            }

            let file = match File::open(&log_path) {
                Ok(f) => f,
                Err(e) => {
                    let _ = app_handle.emit("sync-log-error", format!("Failed to open log file: {}", e));
                    return;
                }
            };

            let mut reader = BufReader::new(file);
            // Seek to the end of the file to ignore old logs
            let _ = reader.seek(SeekFrom::End(0));

            let mut line = String::new();
            let client = reqwest::blocking::Client::new();

            while !stop_flag.load(Ordering::SeqCst) {
                line.clear();
                match reader.read_line(&mut line) {
                    Ok(0) => {
                        // EOF reached, sleep for a short while before polling again
                        thread::sleep(Duration::from_millis(500));
                    }
                    Ok(_) => {
                        let trimmed = line.trim();
                        if trimmed.is_empty() {
                            continue;
                        }

                        // Check if it's a chat message or advancement
                        let is_chat = trimmed.contains("[CHAT]") || trimmed.contains("<");
                        let is_advancement = trimmed.contains("has made the advancement");

                        if is_chat || is_advancement {
                            let has_command = trimmed.contains("#journal") || trimmed.contains("#coords");
                            if has_command || is_advancement {
                                println!("Log watcher found matching line: {}", trimmed);
                                let _ = app_handle.emit("sync-log-status", format!("Processing: {}", trimmed));

                                // 1. Attempt Screenshot pairing if it's #journal command
                                let mut is_paired = false;
                                if trimmed.contains("#journal") {
                                    let mut lock = recent_screenshot.lock().unwrap();
                                    if let Some((path, instant)) = &*lock {
                                        // 60 seconds pairing window
                                        if instant.elapsed() < Duration::from_secs(60) {
                                            is_paired = true;
                                            let (title, description) = parse_command_text(trimmed)
                                                .unwrap_or_else(|| ("Screenshot Captured".to_string(), "Automatically captured in-game screenshot.".to_string()));

                                            println!("Pairing screenshot with journal: {:?}", path);
                                            let _ = app_handle.emit("sync-log-status", "Uploading paired screenshot...".to_string());

                                            let url = format!("{}/api/companion/upload", config.web_app_url);
                                            
                                            // Create multipart form data
                                            let form_res = reqwest::blocking::multipart::Form::new()
                                                .text("worldId", config.selected_world_id.clone())
                                                .text("title", title)
                                                .text("description", description)
                                                .text("category", "achievement")
                                                .file("file", path.clone());

                                            match form_res {
                                                Ok(form) => {
                                                    match client.post(&url)
                                                        .header("x-api-key", &config.api_key)
                                                        .multipart(form)
                                                        .send() {
                                                            Ok(response) => {
                                                                let status = response.status();
                                                                if status.is_success() {
                                                                    let _ = app_handle.emit("sync-log-success", "Screenshot logged successfully".to_string());
                                                                } else {
                                                                    let _ = app_handle.emit("sync-log-error", format!("Server rejected screenshot upload: {}", status));
                                                                }
                                                            }
                                                            Err(err) => {
                                                                let _ = app_handle.emit("sync-log-error", format!("Screenshot upload network error: {}", err));
                                                            }
                                                        }
                                                }
                                                Err(err) => {
                                                    let _ = app_handle.emit("sync-log-error", format!("Failed to read screenshot: {}", err));
                                                }
                                            }
                                        }
                                    }

                                    if is_paired {
                                        // Clear queue
                                        *lock = None;
                                    }
                                }

                                // 2. Send standard text log if NOT paired
                                if !is_paired {
                                    let url = format!("{}/api/companion/log", config.web_app_url);
                                    let body = serde_json::json!({
                                        "worldId": config.selected_world_id,
                                        "message": trimmed
                                    });

                                    match client.post(&url)
                                        .header("x-api-key", &config.api_key)
                                        .json(&body)
                                        .send() {
                                            Ok(response) => {
                                                let status = response.status();
                                                if status.is_success() {
                                                    if let Ok(res_json) = response.json::<serde_json::Value>() {
                                                        let msg = res_json["message"].as_str().unwrap_or("Success");
                                                        let _ = app_handle.emit("sync-log-success", msg.to_string());
                                                    }
                                                } else {
                                                    if let Ok(res_json) = response.json::<serde_json::Value>() {
                                                        let err_msg = res_json["message"].as_str().unwrap_or("API Error");
                                                        let _ = app_handle.emit("sync-log-error", format!("Error: {}", err_msg));
                                                    } else {
                                                        let _ = app_handle.emit("sync-log-error", format!("Server returned status {}", status));
                                                    }
                                                }
                                            }
                                            Err(err) => {
                                                let _ = app_handle.emit("sync-log-error", format!("Network error: {}", err));
                                            }
                                        }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        let _ = app_handle.emit("sync-log-error", format!("Error reading log: {}", e));
                        thread::sleep(Duration::from_secs(2));
                    }
                }
            }
            println!("Log watcher stopped.");
        });
    }

    pub fn stop(&self) {
        self.stop_flag.store(true, Ordering::SeqCst);
    }
}
