use std::process::{Command, Stdio};
use std::os::windows::process::CommandExt;
use std::env;
use std::path::Path;
use reqwest::blocking::get;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[tauri::command]
fn launch(ver: usize) -> bool {
    let current_dir = env::current_dir().unwrap();
    let dir_path = current_dir.display().to_string();
    let paths = ["2.2", "2.1", "2.0", "1.9"];
    let exes = ["xps_4.exe", "xps_3.exe", "xps_2.exe", "xps_1.exe"];
    let path = format!("{}/gd/{}/{}", dir_path, paths[ver], exes[ver]);
    let folder = format!("{}/gd/{}", dir_path, paths[ver]);
    let path_check = Path::new(&path);
    let folder_check = Path::new(&folder);

    if !path_check.exists() || !path_check.is_file() {
        return false;
    }

    if !folder_check.exists() || !folder_check.is_dir() {
        return false;
    }

    env::set_current_dir(folder).unwrap();

    let status = Command::new("cmd")
        .arg("/C")
        .arg(format!(r#"start {}"#, path))
        .creation_flags(CREATE_NO_WINDOW)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .expect("Failed to launch the app");

    env::set_current_dir(current_dir).unwrap();

    if status.success() {
        true
    } else {
        false
    }
}

#[tauri::command]
fn check_version() -> bool {
    let current_version = env!("CARGO_PKG_VERSION");
    let url = "https://xps-api.lncvrt.xyz/versions/launcher/version";

    match get(url) {
        Ok(response) => {
            response.text().map_or(false, |text| text.trim() == current_version)
        }
        Err(_) => false,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![launch, check_version])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
