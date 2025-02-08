use open::that;
use reqwest::blocking::get;
use serde::{Deserialize, Serialize};
use std::env;
use std::ffi::OsStr;
use std::path::Path;
use std::process::Command;
use std::time::SystemTime;
use sysinfo::System;
use tauri::{AppHandle, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use webbrowser;

#[derive(Serialize, Deserialize, Debug)]
struct Config {
    theme: i32,
    close_on_load: bool,
    allow_multi_instance: bool,
}

#[tauri::command]
fn launch(app: AppHandle, ver: String, ver_code: i8, base_dir: String) -> bool {
    let path = Path::new(&base_dir)
        .join("gd")
        .join(ver.clone())
        .join(format!("xps_{}.exe", ver_code));

    let folder = Path::new(&base_dir)
        .join("gd")
        .join(ver.clone());

    if (!path.exists() || !path.is_file()) || (!folder.exists() || !folder.is_dir()) {
        app.dialog()
            .message(format!("Checks didn't pass for XPS {}\n\nMake sure the executable is exists and is a valid file.", ver))
            .kind(MessageDialogKind::Error)
            .title(format!("Error launching XPS {}", ver))
            .blocking_show();
        return false;
    }

    env::set_current_dir(folder).unwrap();

    let status = Command::new("cmd")
        .arg("/C")
        .arg("start")
        .arg(format!("{}", path.display()))
        .spawn();

    env::set_current_dir(base_dir).unwrap();

    match status {
        Ok(mut child) => {
            let exit_status = child.wait().unwrap();
            exit_status.success()
        }
        Err(_) => false,
    }
}

#[tauri::command]
fn check_version() -> bool {
    let current_version = get_version();
    let url = "https://xps-api.lncvrt.xyz/versions/launcher/version";

    match get(url) {
        Ok(response) => response
            .text()
            .map_or(false, |text| text.trim() == current_version),
        Err(_) => false,
    }
}

#[tauri::command]
async fn create_website_view(app: AppHandle, url: String) {
    let timestamp = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_millis();

    WebviewWindowBuilder::new(
        &app,
        format!("xps_main_webview_{}", timestamp),
        WebviewUrl::External(url.parse().unwrap()),
    )
    .title("XPS Browser")
    .maximized(true)
    .build()
    .unwrap();
}

#[tauri::command]
async fn check_process(process: String) -> bool {
    let s = System::new_all();
    let os_str = OsStr::new(&process);
    let result = s.processes_by_exact_name(&os_str).next().is_some();
    result
}

#[tauri::command]
fn get_version() -> String {
    return (&env!("CARGO_PKG_VERSION")).to_string();
}

#[tauri::command]
fn open_gd_folders(app: AppHandle, base_dir: String, folders: Vec<String>) {
    let answer = app.dialog()
        .message("Are you sure you want to open the Geometry Dash Folders? This may cause temporary lag to your machine if it is lower end.")
        .title("Are you sure?")
        .buttons(MessageDialogButtons::OkCancel)
        .kind(MessageDialogKind::Warning)
        .blocking_show();

    if answer {
        for folder in folders.iter() {
            let path = Path::new(&base_dir).join("gd").join(folder);
            if path.exists() {
                that(path).expect("Failed to open file explorer");
            }
        }
    }
}

#[tauri::command]
fn open_appdata_folders(app: AppHandle, folders: Vec<String>) {
    let answer = app.dialog()
        .message("Are you sure you want to open the App Data Folders? This may cause temporary lag to your machine if it is lower end.")
        .title("Are you sure?")
        .buttons(MessageDialogButtons::OkCancel)
        .kind(MessageDialogKind::Warning)
        .blocking_show();

    if answer {
        let local_appdata = env::var("LOCALAPPDATA").expect("Failed to get LOCALAPPDATA");

        for folder in folders.iter() {
            let path = Path::new(&local_appdata).join(folder);
            if path.exists() {
                that(path).expect("Failed to open file explorer");
            }
        }

        app.dialog()
            .message("Here's what the folders mean:\n\nxps_1 = 1.9\nxps_2 = 2.0\nxps_3 = 2.1\nxps_4 = 2.2")
            .title("Incase you are confused")
            .blocking_show();
    }
}

#[tauri::command]
fn open_browser(url: &str) {
    if webbrowser::open(url).is_err() {
        eprintln!("Failed to open browser.");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            launch,
            check_version,
            create_website_view,
            check_process,
            get_version,
            open_gd_folders,
            open_appdata_folders,
            open_browser
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
