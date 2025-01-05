use reqwest::blocking::get;
use std::env;
use std::path::Path;
use std::process::Command;

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

    if (!path_check.exists() || !path_check.is_file()) || (!folder_check.exists() || !folder_check.is_dir()) {
        return false;
    }

    env::set_current_dir(folder).unwrap();

    let status = Command::new("cmd")
        .arg("/C")
        .arg("start")
        .arg(format!("{}", exes[ver]))
        .spawn();

    env::set_current_dir(current_dir).unwrap();

    match status {
        Ok(mut child) => {
            let exit_status = child.wait().unwrap();
            if exit_status.success() {
                true
            } else {
                false
            }
        }
        Err(_) => false,
    }
}

#[tauri::command]
fn check_version() -> bool {
    let current_version = env!("CARGO_PKG_VERSION");
    let url = "https://xps-api.lncvrt.xyz/versions/launcher/version";

    match get(url) {
        Ok(response) => response
            .text()
            .map_or(false, |text| text.trim() == current_version),
        Err(_) => false,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![launch, check_version])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
