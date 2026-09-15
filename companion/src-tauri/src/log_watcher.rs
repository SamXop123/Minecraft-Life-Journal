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

fn classify_category(text: &str) -> (String, String) {
    let text_trim = text.trim();
    // 1. Check for [tag] prefix
    if text_trim.starts_with('[') {
        if let Some(end_idx) = text_trim.find(']') {
            let tag = text_trim[1..end_idx].trim().to_lowercase();
            let clean = text_trim[end_idx + 1..].trim().to_string();
            if !tag.is_empty() && tag.len() <= 20 {
                return (tag, if clean.is_empty() { text_trim.to_string() } else { clean });
            }
        }
    }

    let lower = text_trim.to_lowercase();
    let lower_without_game = lower.replace("minecraft", "");

    // Death
    if lower.contains("died") || lower.contains("death") || lower.contains("killed")
        || lower.contains("slain") || lower.contains("fell from") || lower.contains("lava")
        || lower.contains("drowned") || lower.contains("creeper") || lower.contains("rip") {
        return ("death".to_string(), text_trim.to_string());
    }

    // Combat
    if lower.contains("dragon") || lower.contains("wither") || lower.contains("warden")
        || lower.contains("raid") || lower.contains("fight") || lower.contains("battle")
        || lower.contains("boss") || lower.contains("pvp") || lower.contains("pillager") {
        return ("combat".to_string(), text_trim.to_string());
    }

    // Mining
    if lower.contains("diamond") || lower.contains("netherite") || lower.contains("ancient debris")
        || lower.contains("iron") || lower.contains("gold") || lower.contains("emerald")
        || lower.contains("ore") || lower.contains("cave") || lower_without_game.contains("mine")
        || lower.contains("geode") || lower.contains("deepslate") {
        return ("mining".to_string(), text_trim.to_string());
    }

    // Building
    if lower.contains("build") || lower.contains("built") || lower.contains("house")
        || lower.contains("base") || lower.contains("castle") || lower.contains("farm")
        || lower.contains("tower") || lower.contains("roof") || lower.contains("bridge")
        || lower.contains("storage") || lower.contains("dock") {
        return ("build".to_string(), text_trim.to_string());
    }

    // Exploration
    if lower.contains("found") || lower.contains("discovered") || lower.contains("explore")
        || lower.contains("biome") || lower.contains("mansion") || lower.contains("village")
        || lower.contains("temple") || lower.contains("elytra") || lower.contains("shipwreck")
        || lower.contains("stronghold") || lower.contains("journey") {
        return ("exploration".to_string(), text_trim.to_string());
    }

    // Redstone
    if lower.contains("redstone") || lower.contains("piston") || lower.contains("contraption")
        || lower.contains("automated") || lower.contains("sorter") || lower.contains("hopper") {
        return ("redstone".to_string(), text_trim.to_string());
    }

    // Funny
    if lower.contains("lol") || lower.contains("lmao") || lower.contains("haha")
        || lower.contains("funny") || lower.contains("fail") || lower.contains("joke") || lower.contains("oops") {
        return ("funny".to_string(), text_trim.to_string());
    }

    // Emotional / Pets
    if lower.contains("love") || lower.contains("sad") || lower.contains("miss")
        || lower.contains("sunset") || lower.contains("pet") || lower.contains("dog")
        || lower.contains("cat") || lower.contains("wolf") || lower.contains("wholesome") {
        return ("emotional".to_string(), text_trim.to_string());
    }

    // Achievement
    if lower.contains("advancement") || lower.contains("achievement") || lower.contains("unlocked")
        || lower.contains("milestone") || lower.contains("100 days") {
        return ("achievement".to_string(), text_trim.to_string());
    }

    ("story".to_string(), text_trim.to_string())
}

fn parse_command_text(trimmed_line: &str) -> Option<(String, String, String)> {
    if let Some(pos) = trimmed_line.find("#journal") {
        let text = trimmed_line[pos + 8..].trim();
        if !text.is_empty() {
            let (category, clean_text) = classify_category(text);
            let title = if clean_text.len() > 45 { format!("{}...", &clean_text[..42]) } else { clean_text.clone() };
            return Some((title, clean_text, category));
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

fn get_api_targets(configured_url: &str) -> Vec<String> {
    let mut targets = vec![
        configured_url.to_string(),
        "https://www.mlj.app".to_string(),
        "https://mlj.app".to_string(),
        "https://minecraft-life-journal.vercel.app".to_string(),
        "http://localhost:3000".to_string(),
    ];
    targets.retain(|t| !t.trim().is_empty());
    targets.dedup();
    targets
}

fn upload_paired_screenshot(
    client: &reqwest::blocking::Client,
    config: &crate::config::AppConfig,
    title: &str,
    description: &str,
    category: &str,
    file_bytes: &[u8],
    filename: &str,
) -> Result<String, String> {
    let targets = get_api_targets(&config.web_app_url);
    let mut last_err = String::from("Screenshot upload failed");

    for base in &targets {
        let mut target_url = format!("{}/api/companion/upload", base.trim_end_matches('/'));

        // Follow up to 3 redirects per domain target
        for _ in 0..3 {
            let part = reqwest::blocking::multipart::Part::bytes(file_bytes.to_vec())
                .file_name(filename.to_string())
                .mime_str(if filename.ends_with(".png") { "image/png" } else { "image/jpeg" })
                .unwrap_or_else(|_| reqwest::blocking::multipart::Part::bytes(file_bytes.to_vec()));

            let form = reqwest::blocking::multipart::Form::new()
                .text("worldId", config.selected_world_id.clone())
                .text("title", title.to_string())
                .text("description", description.to_string())
                .text("category", category.to_string())
                .part("file", part);

            match client.post(&target_url)
                .header("x-api-key", &config.api_key)
                .multipart(form)
                .send() {
                    Ok(resp) => {
                        let status = resp.status();
                        if status.is_success() {
                            return Ok("Screenshot logged successfully".to_string());
                        } else if status.is_redirection() {
                            if let Some(loc) = resp.headers().get("Location") {
                                if let Ok(loc_str) = loc.to_str() {
                                    target_url = loc_str.to_string();
                                    continue;
                                }
                            }
                            last_err = format!("Server redirected ({}) without location header", status);
                            break;
                        } else {
                            last_err = format!("Server ({}) returned status {}", base, status);
                            break;
                        }
                    }
                    Err(e) => {
                        last_err = format!("Network error ({}): {}", base, e);
                        break;
                    }
                }
        }
    }

    Err(last_err)
}

fn send_text_log(
    client: &reqwest::blocking::Client,
    config: &crate::config::AppConfig,
    message: &str,
) -> Result<String, String> {
    let targets = get_api_targets(&config.web_app_url);
    let mut last_err = String::from("Log sending failed");
    let body = serde_json::json!({
        "worldId": config.selected_world_id,
        "message": message
    });

    for base in &targets {
        let mut target_url = format!("{}/api/companion/log", base.trim_end_matches('/'));

        for _ in 0..3 {
            match client.post(&target_url)
                .header("x-api-key", &config.api_key)
                .json(&body)
                .send() {
                    Ok(resp) => {
                        let status = resp.status();
                        if status.is_success() {
                            if let Ok(res_json) = resp.json::<serde_json::Value>() {
                                let msg = res_json["message"].as_str().unwrap_or("Success");
                                return Ok(msg.to_string());
                            }
                            return Ok("Logged successfully".to_string());
                        } else if status.is_redirection() {
                            if let Some(loc) = resp.headers().get("Location") {
                                if let Ok(loc_str) = loc.to_str() {
                                    target_url = loc_str.to_string();
                                    continue;
                                }
                            }
                            last_err = format!("Server redirected ({}) without location header", status);
                            break;
                        } else {
                            if let Ok(res_json) = resp.json::<serde_json::Value>() {
                                if let Some(err_msg) = res_json["message"].as_str() {
                                    last_err = format!("Error: {}", err_msg);
                                    break;
                                }
                            }
                            last_err = format!("Server ({}) returned status {}", base, status);
                            break;
                        }
                    }
                    Err(e) => {
                        last_err = format!("Network error ({}): {}", base, e);
                        break;
                    }
                }
        }
    }

    Err(last_err)
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
                let client = reqwest::blocking::Client::builder()
                    .timeout(Duration::from_secs(10))
                    .build()
                    .unwrap_or_else(|_| reqwest::blocking::Client::new());

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

                            // Skip Server thread logs ONLY for commands to avoid duplicate triggers in singleplayer,
                            // but allow advancements (since they are only logged by Server thread in singleplayer).
                            if trimmed.contains("[Server thread/INFO]") && (trimmed.contains("#journal") || trimmed.contains("#coords")) {
                                continue;
                            }

                            let is_advancement = trimmed.contains("has made the advancement");
                            let has_command = trimmed.contains("#journal") || trimmed.contains("#coords");

                            if has_command || is_advancement {
                                println!("Log watcher found matching line: {}", trimmed);
                                let _ = app_handle_clone.emit("sync-log-status", format!("Processing: {}", trimmed));

                                // 1. Attempt Screenshot pairing if it's #journal command
                                let mut screenshot_upload_succeeded = false;
                                if trimmed.contains("#journal") {
                                    let mut lock = recent_screenshot.lock().unwrap();
                                    if let Some((path, instant)) = &*lock {
                                        // 180 seconds pairing window
                                        if instant.elapsed() < Duration::from_secs(180) {
                                            let (title, description, category) = parse_command_text(trimmed)
                                                .unwrap_or_else(|| ("Screenshot Captured".to_string(), "Automatically captured in-game screenshot.".to_string(), "story".to_string()));

                                            println!("Pairing screenshot with journal: {:?}", path);
                                            let _ = app_handle_clone.emit("sync-log-status", "Compressing screenshot...".to_string());

                                            // Attempt compression
                                            let (upload_path, is_temp) = match compress_to_temp_jpeg(path) {
                                                Some(temp_path) => (temp_path, true),
                                                None => (path.clone(), false),
                                            };

                                            let _ = app_handle_clone.emit("sync-log-status", "Uploading paired screenshot...".to_string());

                                            if let Ok(file_bytes) = fs::read(&upload_path) {
                                                let filename = upload_path.file_name()
                                                    .map(|f| f.to_string_lossy().into_owned())
                                                    .unwrap_or_else(|| "screenshot.jpg".to_string());

                                                match upload_paired_screenshot(&client, &config_clone, &title, &description, &category, &file_bytes, &filename) {
                                                    Ok(success_msg) => {
                                                        screenshot_upload_succeeded = true;
                                                        let _ = app_handle_clone.emit("sync-log-success", success_msg);
                                                    }
                                                    Err(err) => {
                                                        let _ = app_handle_clone.emit("sync-log-error", format!("Screenshot upload issue: {}. Falling back to text journal...", err));
                                                    }
                                                }
                                            } else {
                                                let _ = app_handle_clone.emit("sync-log-error", "Could not read screenshot file. Falling back to text journal...".to_string());
                                            }

                                            // Cleanup temporary file if it was compressed
                                            if is_temp {
                                                let _ = std::fs::remove_file(&upload_path);
                                            }
                                        }
                                    }

                                    // Always clear queue so screenshots don't linger for subsequent entries
                                    *lock = None;
                                }

                                // 2. Send standard text log if screenshot upload was not applicable or failed
                                if !screenshot_upload_succeeded {
                                    match send_text_log(&client, &config_clone, trimmed) {
                                        Ok(msg) => {
                                            let _ = app_handle_clone.emit("sync-log-success", msg);
                                        }
                                        Err(err) => {
                                            let _ = app_handle_clone.emit("sync-log-error", err);
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
