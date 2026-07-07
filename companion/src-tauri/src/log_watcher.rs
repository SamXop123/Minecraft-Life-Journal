use std::fs::{self, File};
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

fn compress_to_temp_jpeg(png_path: &Path) -> Option<PathBuf> {
    println!("Starting image compression for {:?}", png_path);
    let img = match image::open(png_path) {
        Ok(i) => i,
        Err(e) => {
            println!("Failed to open image {:?} for compression: {}", png_path, e);
            return None;
        }
    };

    let temp_dir = std::env::temp_dir();
    let temp_filename = format!("mlj_screenshot_{}.jpg", Instant::now().elapsed().as_micros());
    let temp_path = temp_dir.join(temp_filename);

    println!("Compressing image to {:?}", temp_path);
    let mut file = match File::create(&temp_path) {
        Ok(f) => f,
        Err(e) => {
            println!("Failed to create temp file {:?}: {}", temp_path, e);
            return None;
        }
    };
    let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut file, 80);
    match encoder.encode_image(&img) {
        Ok(_) => Some(temp_path),
        Err(e) => {
            println!("Failed to encode jpeg: {}", e);
            let _ = std::fs::remove_file(&temp_path);
            None
        }
    }
}

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

fn get_log_paths(minecraft_path: &str) -> Vec<PathBuf> {
    let mut paths = Vec::new();
    
    // 1. Standard / User-specified path
    let std_path = Path::new(minecraft_path).join("logs").join("latest.log");
    paths.push(std_path);
    
    // 2. Lunar Client paths (scanning profiles directory dynamically)
    if let Ok(home) = std::env::var("USERPROFILE").or_else(|_| std::env::var("HOME")) {
        let profiles_dir = Path::new(&home)
            .join(".lunarclient")
            .join("profiles");
            
        if let Ok(entries) = fs::read_dir(&profiles_dir) {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_dir() {
                        let log_path = path.join("logs").join("latest.log");
                        paths.push(log_path);
                    }
                }
            }
        }
    }
    
    // Keep only unique paths
    paths.sort();
    paths.dedup();
    
    paths
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
        let config = load_config();
        if config.api_key.is_empty() || config.selected_world_id.is_empty() {
            return;
        }

        let paths = get_log_paths(&config.minecraft_path);
        
        for log_path in paths {
            let stop_flag = self.stop_flag.clone();
            let recent_screenshot = self.recent_screenshot.clone();
            let app_handle_clone = app_handle.clone();
            let config_clone = config.clone();
            
            thread::spawn(move || {
                println!("Log watcher starting on path: {:?}", log_path);
                
                // Wait for file to exist
                while !log_path.exists() && !stop_flag.load(Ordering::SeqCst) {
                    thread::sleep(Duration::from_secs(2));
                }

                if stop_flag.load(Ordering::SeqCst) {
                    return;
                }

                let mut file = match File::open(&log_path) {
                    Ok(f) => f,
                    Err(e) => {
                        println!("Failed to open log file {:?}: {}", log_path, e);
                        return;
                    }
                };
                let mut current_created = fs::metadata(&log_path).and_then(|m| m.created()).ok();

                let mut reader = BufReader::new(file);
                // Seek to the end of the file to ignore old logs
                let _ = reader.seek(SeekFrom::End(0));
                let mut pos = reader.seek(SeekFrom::Current(0)).unwrap_or(0);

                let mut line = String::new();
                let client = reqwest::blocking::Client::new();

                while !stop_flag.load(Ordering::SeqCst) {
                    line.clear();
                    match reader.read_line(&mut line) {
                        Ok(0) => {
                            // EOF reached, check for file rotation
                            thread::sleep(Duration::from_millis(500));

                            let rotated = if let Ok(meta) = fs::metadata(&log_path) {
                                let new_created = meta.created().ok();
                                new_created != current_created || meta.len() < pos
                            } else {
                                false
                            };

                            if rotated {
                                println!("Log file rotated/recreated, reopening: {:?}", log_path);
                                let _ = app_handle_clone.emit("sync-log-status", "Log file rotated. Reopening...".to_string());
                                if let Ok(f) = File::open(&log_path) {
                                    current_created = fs::metadata(&log_path).and_then(|m| m.created()).ok();
                                    reader = BufReader::new(f);
                                    pos = 0;
                                }
                            }
                        }
                        Ok(bytes_read) => {
                            pos += bytes_read as u64;
                            let trimmed = line.trim();
                            if trimmed.is_empty() {
                                continue;
                            }

                            // Skip lines printed by the local server thread to avoid duplicates in singleplayer
                            if trimmed.contains("[Server thread/INFO]") {
                                continue;
                            }

                            let is_advancement = trimmed.contains("has made the advancement");
                            let has_command = trimmed.contains("#journal") || trimmed.contains("#coords");

                            if has_command || is_advancement {
                                println!("Log watcher found matching line: {}", trimmed);
                                let _ = app_handle_clone.emit("sync-log-status", format!("Processing: {}", trimmed));

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
                                            let _ = app_handle_clone.emit("sync-log-status", "Compressing screenshot...".to_string());

                                            // Attempt compression
                                            let (upload_path, is_temp) = match compress_to_temp_jpeg(path) {
                                                Some(temp_path) => {
                                                    println!("Compression successful: {:?}", temp_path);
                                                    (temp_path, true)
                                                }
                                                None => {
                                                    println!("Compression failed. Falling back to original PNG: {:?}", path);
                                                    (path.clone(), false)
                                                }
                                            };

                                            let _ = app_handle_clone.emit("sync-log-status", "Uploading paired screenshot...".to_string());

                                            let url = format!("{}/api/companion/upload", config_clone.web_app_url);
                                            
                                            // Create multipart form data
                                            let form_res = reqwest::blocking::multipart::Form::new()
                                                .text("worldId", config_clone.selected_world_id.clone())
                                                .text("title", title)
                                                .text("description", description)
                                                .text("category", "achievement")
                                                .file("file", upload_path.clone());

                                            match form_res {
                                                Ok(form) => {
                                                    match client.post(&url)
                                                        .header("x-api-key", &config_clone.api_key)
                                                        .multipart(form)
                                                        .send() {
                                                            Ok(response) => {
                                                                let status = response.status();
                                                                if status.is_success() {
                                                                    let _ = app_handle_clone.emit("sync-log-success", "Screenshot logged successfully".to_string());
                                                                } else {
                                                                    let _ = app_handle_clone.emit("sync-log-error", format!("Server rejected screenshot upload: {}", status));
                                                                }
                                                            }
                                                            Err(err) => {
                                                                let _ = app_handle_clone.emit("sync-log-error", format!("Screenshot upload network error: {}", err));
                                                            }
                                                        }
                                                }
                                                Err(err) => {
                                                    let _ = app_handle_clone.emit("sync-log-error", format!("Failed to read screenshot: {}", err));
                                                }
                                            }

                                            // Cleanup temporary file if it was compressed
                                            if is_temp {
                                                println!("Cleaning up temp file: {:?}", upload_path);
                                                let _ = std::fs::remove_file(&upload_path);
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
                                    let url = format!("{}/api/companion/log", config_clone.web_app_url);
                                    let body = serde_json::json!({
                                        "worldId": config_clone.selected_world_id,
                                        "message": trimmed
                                    });

                                    match client.post(&url)
                                        .header("x-api-key", &config_clone.api_key)
                                        .json(&body)
                                        .send() {
                                            Ok(response) => {
                                                let status = response.status();
                                                if status.is_success() {
                                                    if let Ok(res_json) = response.json::<serde_json::Value>() {
                                                        let msg = res_json["message"].as_str().unwrap_or("Success");
                                                        let _ = app_handle_clone.emit("sync-log-success", msg.to_string());
                                                    }
                                                } else {
                                                    if let Ok(res_json) = response.json::<serde_json::Value>() {
                                                        let err_msg = res_json["message"].as_str().unwrap_or("API Error");
                                                        let _ = app_handle_clone.emit("sync-log-error", format!("Error: {}", err_msg));
                                                    } else {
                                                        let _ = app_handle_clone.emit("sync-log-error", format!("Server returned status {}", status));
                                                    }
                                                }
                                            }
                                            Err(err) => {
                                                let _ = app_handle_clone.emit("sync-log-error", format!("Network error: {}", err));
                                            }
                                        }
                                }
                            }
                        }
                        Err(e) => {
                            let _ = app_handle_clone.emit("sync-log-error", format!("Error reading log: {}", e));
                            thread::sleep(Duration::from_secs(2));
                        }
                    }
                }
                println!("Log watcher stopped for path: {:?}", log_path);
            });
        }
    }

    pub fn stop(&self) {
        self.stop_flag.store(true, Ordering::SeqCst);
    }
}
