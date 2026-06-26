use notify::{Watcher, RecursiveMode};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use tauri::AppHandle;
use tauri::Emitter;
use crate::config::load_config;

pub type SharedScreenshot = Arc<Mutex<Option<(PathBuf, Instant)>>>;

pub struct ScreenshotWatcherManager {
    stop_flag: Arc<std::sync::atomic::AtomicBool>,
    recent_screenshot: SharedScreenshot,
}

impl ScreenshotWatcherManager {
    pub fn new(recent_screenshot: SharedScreenshot) -> Self {
        Self {
            stop_flag: Arc::new(std::sync::atomic::AtomicBool::new(false)),
            recent_screenshot,
        }
    }

    fn get_screenshot_paths(minecraft_path: &str) -> Vec<PathBuf> {
        let mut paths = Vec::new();
        
        // 1. Standard / User-specified path
        let std_path = Path::new(minecraft_path).join("screenshots");
        paths.push(std_path);
        
        // 2. Lunar Client path
        if let Ok(home) = std::env::var("USERPROFILE").or_else(|_| std::env::var("HOME")) {
            let lunar_path = Path::new(&home)
                .join(".lunarclient")
                .join("offline")
                .join("multiver")
                .join("screenshots");
            paths.push(lunar_path);
        }
        
        // Keep only unique paths
        paths.sort();
        paths.dedup();
        
        paths
    }

    pub fn start(&self, app_handle: AppHandle) {
        self.stop_flag.store(false, std::sync::atomic::Ordering::SeqCst);
        let config = load_config();
        if config.api_key.is_empty() || config.selected_world_id.is_empty() {
            return;
        }

        let paths = Self::get_screenshot_paths(&config.minecraft_path);
        
        for screenshots_path in paths {
            let stop_flag = self.stop_flag.clone();
            let recent_screenshot = self.recent_screenshot.clone();
            let app_handle_clone = app_handle.clone();
            
            thread::spawn(move || {
                println!("Screenshot watcher starting on path: {:?}", screenshots_path);
                
                // Wait for screenshots folder to exist
                while !screenshots_path.exists() && !stop_flag.load(std::sync::atomic::Ordering::SeqCst) {
                    thread::sleep(Duration::from_secs(2));
                }

                if stop_flag.load(std::sync::atomic::Ordering::SeqCst) {
                    return;
                }

                let (tx, rx) = std::sync::mpsc::channel();

                // Create notify watcher
                let mut watcher = match notify::recommended_watcher(move |res| {
                    if let Ok(event) = res {
                        let _ = tx.send(event);
                    }
                }) {
                    Ok(w) => w,
                    Err(e) => {
                        println!("Failed to start screenshot watcher for {:?}: {}", screenshots_path, e);
                        return;
                    }
                };

                if let Err(e) = watcher.watch(&screenshots_path, RecursiveMode::NonRecursive) {
                    println!("Failed to watch screenshots directory {:?}: {}", screenshots_path, e);
                    return;
                }

                // Keep watcher alive in thread
                let _watcher_handle = watcher;

                while !stop_flag.load(std::sync::atomic::Ordering::SeqCst) {
                    // Read filesystem events with timeout
                    if let Ok(event) = rx.recv_timeout(Duration::from_millis(500)) {
                        // Check if it's a create event or any modify/rename event that indicates file save
                        if event.kind.is_create() || event.kind.is_modify() {
                            for path in event.paths {
                                if let Some(ext) = path.extension() {
                                    let ext_str = ext.to_string_lossy().to_lowercase();
                                    if ext_str == "png" || ext_str == "jpg" || ext_str == "jpeg" {
                                        // Check if the path actually exists (sometimes notify triggers early on temp files)
                                        if path.exists() {
                                            println!("Screenshot detected: {:?}", path);
                                            let filename = path.file_name()
                                                .map(|f| f.to_string_lossy().into_owned())
                                                .unwrap_or_else(|| "screenshot.png".to_string());
                                            
                                            // Save in shared memory
                                            if let Ok(mut lock) = recent_screenshot.lock() {
                                                *lock = Some((path.clone(), Instant::now()));
                                            }

                                            let _ = app_handle_clone.emit("screenshot-detected", filename);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                println!("Screenshot watcher stopped for path: {:?}", screenshots_path);
            });
        }
    }

    pub fn stop(&self) {
        self.stop_flag.store(true, std::sync::atomic::Ordering::SeqCst);
    }
}
