use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;

fn default_web_url() -> String {
    "http://localhost:3000".to_string()
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppConfig {
    pub api_key: String,
    pub minecraft_path: String,
    pub selected_world_id: String,
    pub selected_world_name: String,
    #[serde(default = "default_web_url")]
    pub web_app_url: String,
}

pub fn get_home_dir() -> PathBuf {
    if let Ok(profile) = std::env::var("USERPROFILE") {
        PathBuf::from(profile)
    } else if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home)
    } else {
        PathBuf::from(".")
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        let mut mc_path = get_home_dir();
        // On Windows, the default is %appdata%/.minecraft
        if let Ok(appdata) = std::env::var("APPDATA") {
            mc_path = PathBuf::from(appdata);
        } else {
            // Fallback for Windows/macOS/Linux standard home layout
            #[cfg(target_os = "windows")]
            {
                mc_path.push("AppData");
                mc_path.push("Roaming");
            }
            #[cfg(target_os = "macos")]
            {
                mc_path.push("Library");
                mc_path.push("Application Support");
            }
        }
        mc_path.push(".minecraft");

        Self {
            api_key: String::new(),
            minecraft_path: mc_path.to_string_lossy().to_string(),
            selected_world_id: String::new(),
            selected_world_name: String::new(),
            web_app_url: if cfg!(debug_assertions) {
                "http://localhost:3000".to_string()
            } else {
                "https://minecraft-life-journal.vercel.app".to_string()
            },
        }
    }
}

pub fn get_config_path() -> PathBuf {
    let mut path = get_home_dir();
    path.push(".mlj-companion");
    path.push("config.json");
    path
}

pub fn load_config() -> AppConfig {
    let path = get_config_path();
    let mut config = if !path.exists() {
        AppConfig::default()
    } else {
        match fs::read_to_string(&path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_else(|_| AppConfig::default()),
            Err(_) => AppConfig::default(),
        }
    };
    
    // Override web_app_url dynamically at runtime based on the build type (debug vs release)
    config.web_app_url = if cfg!(debug_assertions) {
        "http://localhost:3000".to_string()
    } else {
        "https://minecraft-life-journal.vercel.app".to_string()
    };
    
    config
}

pub fn save_config(config: &AppConfig) -> Result<(), String> {
    let path = get_config_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    
    let content = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(())
}
