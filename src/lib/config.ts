import { appConfigDir } from '@tauri-apps/api/path';
import { exists, create, BaseDirectory, mkdir, readFile, remove } from '@tauri-apps/plugin-fs';

interface config3_0_0 {
    config_version: number;
    theme: number;
    closeLauncherOnLoad: boolean;
    allowMultipleInstances: boolean;
    disableTransition: boolean;
    extraThemes: boolean;
    selectedVersion: number;
}

const defaultConfig: config3_0_0 = { config_version: 3_0_0, theme: 0, closeLauncherOnLoad: true, allowMultipleInstances: false, disableTransition: false, extraThemes: false, selectedVersion: 3 };

export const versionNames = ["1.9", "2.0", "2.1", "2.2"]

export const getConfig = async () => {
    const fileExists = await exists("data.json", { baseDir: BaseDirectory.AppConfig });
    if (!fileExists) {
        await setupConfig();
    }
    const data = await readFile("data.json", { baseDir: BaseDirectory.AppConfig });
    const jsonData = JSON.parse(new TextDecoder().decode(data));

    return jsonData;
}

export const setConfig = async (data: config3_0_0) => {
    const fileExists = await exists("data.json", { baseDir: BaseDirectory.AppConfig });
    if (!fileExists) {
        await setupConfig();
    }

    const file = await readFile("data.json", { baseDir: BaseDirectory.AppConfig });
    const jsonData = JSON.parse(new TextDecoder().decode(file));

    const updatedConfig = { ...jsonData, ...data };

    const updatedFile = await create("data.json", { baseDir: BaseDirectory.AppConfig });
    await updatedFile.write(new TextEncoder().encode(JSON.stringify(updatedConfig)));
    await updatedFile.close();
}


export const setupConfig = async () => {
    const appDataDirPath = await appConfigDir();
    if (!await exists(appDataDirPath)) {
        mkdir(appDataDirPath);
    }

    const fileExists = await exists("data.json", { baseDir: BaseDirectory.AppConfig });
    if (fileExists) {
        remove("data.json", { baseDir: BaseDirectory.AppConfig })
    }
    const file = await create("data.json", { baseDir: BaseDirectory.AppConfig });
    await file.write(new TextEncoder().encode(JSON.stringify(defaultConfig)));
    await file.close();

}

export const getBackgroundColor = async () => {
  const config = await getConfig()

  switch (config.theme) {
    case 1:
      return "000000";
    case 2:
      return "190032";
    case 3:
      return "230000";
    case 4:
      return "000855";
    case 5:
      return "1b5000";
    case 6:
      return "502500";
    case 7:
      return "500045";
    case 8:
      return "4b5000";
    case 9:
      return "00408a";
    default:
      return "323232";
  }
}