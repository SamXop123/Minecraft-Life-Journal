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

    pub fn start(&self, app_handle: AppHandle) {
        self.stop_flag.store(false, std::sync::atomic::Ordering::SeqCst);
        let stop_flag = self.stop_flag.clone();
        let recent_screenshot = self.recent_screenshot.clone();

        thread::spawn(move || {
            let config = load_config();
            if config.api_key.is_empty() || config.selected_world_id.is_empty() {
                return;
            }

            let screenshots_path = Path::new(&config.minecraft_path).join("screenshots");
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
                    let _ = app_handle.emit("sync-log-error", format!("Failed to start screenshot watcher: {}", e));
                    return;
                }
            };

            if let Err(e) = watcher.watch(&screenshots_path, RecursiveMode::NonRecursive) {
                let _ = app_handle.emit("sync-log-error", format!("Failed to watch screenshots directory: {}", e));
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

                                        let _ = app_handle.emit("screenshot-detected", filename);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            println!("Screenshot watcher stopped.");
        });
    }

    pub fn stop(&self) {
        self.stop_flag.store(true, std::sync::atomic::Ordering::SeqCst);
    }
}
