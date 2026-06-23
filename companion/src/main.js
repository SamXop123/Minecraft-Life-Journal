// Retrieve Tauri APIs exposed via window.__TAURI__ since withGlobalTauri: true is enabled
const { invoke } = window.__TAURI__.core;
const { listen } = window.__TAURI__.event;

// UI Elements
const apiKeyInput = document.getElementById("api-key-input");
const mcPathInput = document.getElementById("mc-path-input");
const worldSelect = document.getElementById("world-select");
const validateBtn = document.getElementById("validate-btn");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const mcStatusText = document.getElementById("mc-status-text");
const consoleLogs = document.getElementById("console-logs");

let currentConfig = null;

// Logger helper
function log(msg, type = "info") {
  const el = document.createElement("div");
  el.className = `log-entry ${type}`;
  const time = new Date().toLocaleTimeString();
  el.innerText = `[${time}] ${msg}`;
  consoleLogs.appendChild(el);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Format date helper (matches standard formatting)
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

// ═══════════════════════════════════════
// TAURI CALLS
// ═══════════════════════════════════════

async function init() {
  try {
    // Load config
    currentConfig = await invoke("get_config");
    apiKeyInput.value = currentConfig.api_key;
    mcPathInput.value = currentConfig.minecraft_path;

    log("Loaded local configuration settings.");

    if (currentConfig.api_key) {
      await handleValidate(false);
    }
  } catch (err) {
    log(`Initialization error: ${err}`, "error");
  }
}

async function handleValidate(verbose = true) {
  const apiKey = apiKeyInput.value.trim();
  const mcPath = mcPathInput.value.trim();
  const webUrl = currentConfig ? currentConfig.web_app_url : "http://localhost:3000";

  if (!apiKey) {
    if (verbose) alert("Please enter your API key first.");
    return;
  }

  if (verbose) log("Validating API key connection...");

  try {
    // Call backend to fetch worlds via API Key
    const data = await invoke("fetch_worlds", { apiKey, webAppUrl: webUrl });
    const worlds = data.worlds || [];

    // Clear dropdown
    worldSelect.innerHTML = "";

    if (worlds.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.innerText = "-- No Worlds Found. Create one on website --";
      worldSelect.appendChild(opt);
      worldSelect.disabled = true;
      startBtn.disabled = true;
      return;
    }

    // Populate dropdown
    worlds.forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w._id;
      opt.innerText = `${w.name} (v${w.mcVersion})`;
      if (currentConfig && w._id === currentConfig.selected_world_id) {
        opt.selected = true;
      }
      worldSelect.appendChild(opt);
    });

    worldSelect.disabled = false;
    startBtn.disabled = false;

    // Save key details
    currentConfig.api_key = apiKey;
    currentConfig.minecraft_path = mcPath;
    saveCurrentSettings();

    log("API Connection verified! Worlds retrieved successfully.", "success");
  } catch (err) {
    log(`Validation failed: ${err}`, "error");
    worldSelect.disabled = true;
    startBtn.disabled = true;
  }
}

async function saveCurrentSettings() {
  if (!currentConfig) return;
  
  const selectedIndex = worldSelect.selectedIndex;
  if (selectedIndex >= 0) {
    currentConfig.selected_world_id = worldSelect.options[selectedIndex].value;
    currentConfig.selected_world_name = worldSelect.options[selectedIndex].text;
  }

  try {
    await invoke("save_config", { config: currentConfig });
  } catch (err) {
    log(`Failed to save settings: ${err}`, "error");
  }
}

async function handleStart() {
  await saveCurrentSettings();
  log("Starting file monitoring and process watchers...", "status");
  
  try {
    await invoke("start_watchers");
    statusDot.className = "status-dot active";
    statusText.innerText = "Monitoring";
    statusText.style.color = "#22c55e";

    startBtn.disabled = true;
    stopBtn.disabled = false;
    apiKeyInput.disabled = true;
    mcPathInput.disabled = true;
    worldSelect.disabled = true;
    validateBtn.disabled = true;
  } catch (err) {
    log(`Start failed: ${err}`, "error");
  }
}

async function handleStop() {
  log("Stopping watchers...", "status");
  
  try {
    await invoke("stop_watchers");
    statusDot.className = "status-dot";
    statusText.innerText = "Disconnected";
    statusText.style.color = "#ef4444";

    startBtn.disabled = false;
    stopBtn.disabled = true;
    apiKeyInput.disabled = false;
    mcPathInput.disabled = false;
    worldSelect.disabled = false;
    validateBtn.disabled = false;
  } catch (err) {
    log(`Stop failed: ${err}`, "error");
  }
}

// ═══════════════════════════════════════
// BIND EVENTS
// ═══════════════════════════════════════

validateBtn.addEventListener("click", () => handleValidate(true));
startBtn.addEventListener("click", handleStart);
stopBtn.addEventListener("click", handleStop);
worldSelect.addEventListener("change", saveCurrentSettings);

// Listen to backend notifications
listen("sync-log-status", (event) => log(event.payload, "status"));
listen("sync-log-success", (event) => log(event.payload, "success"));
listen("sync-log-error", (event) => log(event.payload, "error"));
listen("screenshot-detected", (event) => log(`Screenshot captured: "${event.payload}". Waiting 60s for journal command...`, "info"));
listen("minecraft-status", (event) => {
  const isRunning = event.payload;
  mcStatusText.innerText = isRunning ? "Minecraft: Running" : "Minecraft: Closed";
  mcStatusText.style.color = isRunning ? "#22c55e" : "rgba(255,224,176,0.5)";
});

// Run
init();
