import React, { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { message, confirm } from '@tauri-apps/plugin-dialog';
import { exit, relaunch } from '@tauri-apps/plugin-process';
import { getBackgroundColor, getConfig, setConfig, setupConfig, versionNames } from "./lib/config";
import { appDataDir } from "@tauri-apps/api/path";

export default function App() {
  const [scene, setScene] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);
  const xpsLogoPressCounter = useRef(1);
  const [launcherVer, setLauncherVer] = useState<string>("N/A");
  const [changeVersion, setChangeVersion] = useState<boolean>(false);

  //cfg shit
  const [closeLauncherOnLoad, setCloseLauncherOnLoad] = useState<boolean>(true);
  const [allowMultipleInstances, setAllowMultipleInstances] = useState<boolean>(false);
  const [disableTransition, setDisableTransition] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<number>(3);
  const [extraThemes, setExtraThemes] = useState<boolean>(false);
  const [themeNum, setThemeNum] = useState<number>(0);

  const logoTypes = ["gold", "dark", "purple", "red", "blue", "green", "orange", "pink", "gold", "lb"];

  async function launch() {
    if (!allowMultipleInstances && await checkLoaded()) {
      return await message(`Another instance of XPS ${versionNames[selectedVersion]} is loaded! Please close that instance and try again.`, { title: `Failed to launch XPS ${versionNames[selectedVersion]}!`, kind: 'error' });
    }
    const result: boolean = await invoke("launch", { ver: versionNames[selectedVersion], verCode: selectedVersion + 1, baseDir: await appDataDir() });
    if (!result) {
      await message(`Failed to launch XPS ${versionNames[selectedVersion]}!`, { title: `Failed to launch XPS ${versionNames[selectedVersion]}!`, kind: 'error' });
    } else {
      if (closeLauncherOnLoad) {
        exit(0);
      }
    }
  }

  const showWebsite = async () => {
    await invoke("create_website_view", { url: "https://xps.lncvrt.xyz/" });
  }

  const showDashboard = async () => {
    await invoke("create_website_view", { url: "https://xps.lncvrt.xyz/dashboard/" });
  }

  const closeLauncher = async () => {
    await exit(0);
  };

  const checkLoaded = async () => {
    const result = await invoke("check_process", { process: `xps_${selectedVersion + 1}.exe` });
    return result as boolean;
  };

  const handleXpsLogoPress = (event: React.MouseEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    xpsLogoPressCounter.current = (xpsLogoPressCounter.current + 1) % 8;

    const rotationClasses: Record<number, string> = {
      1: 'rotate-0',
      4: 'rotate-[-20deg]',
      7: 'rotate-[20deg]',
    };

    const rotationClass = rotationClasses[xpsLogoPressCounter.current] || '';
    target.classList.remove(rotationClasses[0], rotationClasses[1], rotationClasses[2]);
    if (rotationClass) target.classList.add(rotationClass);
  };

  const resetLauncher = async () => {
    await setupConfig();
    relaunch();
  };

  const restartLauncher = () => {
    relaunch();
  };

  const openGDFolders = async () => {
    invoke("open_gd_folders", { baseDir: await appDataDir(), folders: versionNames });
  };

  const openAppDataFolder = () => {
    invoke("open_appdata_folders", { folders: versionNames });
  };

  const toggleAllowMultipleInstances = async () => {
    let shouldSet = true;
    if (!allowMultipleInstances) {
      const enableIt = await confirm('You WILL corrupt your savefile with this setting.\nIt\'s highly recommended you cancel.', {
        title: 'Savefile corruption warning!',
        kind: 'warning',
      });
      shouldSet = enableIt;
    }
    if (shouldSet) {
      const config = await getConfig();
      config.allowMultipleInstances = !allowMultipleInstances;
      await setConfig(config);
      setAllowMultipleInstances(!allowMultipleInstances)
    }
  };

  const toggleCloseLauncherOnLoad = async () => {
    const config = await getConfig();
    config.closeLauncherOnLoad = !closeLauncherOnLoad;
    await setConfig(config);
    setCloseLauncherOnLoad(!closeLauncherOnLoad)
  };

  const toggleTransition = async () => {
    const config = await getConfig();
    config.disableTransition = !disableTransition;
    await setConfig(config);
    setDisableTransition(!disableTransition)
  };

  const toggleExtraThemes = async () => {
    const config = await getConfig();
    config.extraThemes = !extraThemes;
    await setConfig(config);
    if (extraThemes) setTheme(0);
    setExtraThemes(!extraThemes);
  };

  const setTheme = async (theme: number) => {
    const config = await getConfig();
    config.theme = theme;
    await setConfig(config)
    setThemeNum(theme);
    const bgcolor = `bg-[#${await getBackgroundColor()}]`;
    document.getElementById("main-section")!.className = `${bgcolor} w-screen h-screen`;
  };

  const saveSetVersion = async () => {
    const config = await getConfig();
    config.selectedVersion = selectedVersion;
    await setConfig(config);
  };

  const openUrl = (url: string) => {
    invoke("open_browser", { url: url });
  };

  const changeScene = (newScene: number) => {
    if (disableTransition) {
      setScene(newScene);
      return;
    }
    setIsFading(true);
    setTimeout(() => {
      setScene(newScene);
      setIsFading(false);
    }, 250);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getConfig();
      setCloseLauncherOnLoad(config.closeLauncherOnLoad);
      setAllowMultipleInstances(config.allowMultipleInstances);
      setSelectedVersion(config.selectedVersion);
      setExtraThemes(config.extraThemes);
      setThemeNum(config.theme);
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchLauncherVersion = async () => {
      const version: string = await invoke("get_version");
      setLauncherVer(version);
    };

    fetchLauncherVersion();
  }, []);

  const MainScene = () => (
    <>
      <div id="top-menu" className="relative w-full h-16 top-0">
        <img onClick={() => closeLauncher()} src="/close.png" width="96" className="gdButton m-2 fixed left-0" />
        <img onClick={() => changeScene(1)} src="/settings.png" width="96" className="gdButton m-2 fixed right-0" />
        <img onClick={(event) => handleXpsLogoPress(event)} src={`/xps-${logoTypes[themeNum]}.png`} className="mt-10 absolute left-1/2 transform -translate-x-[40%]" />
      </div>
      <div id="launch-menu" className="absolute top-[20%] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <img src={`/launch${changeVersion ? '-blue' : ''}.png`} width="180" className={`${changeVersion ? 'gdButton-disabled' : 'gdButton'} m-1`} onClick={() => changeVersion ? null : launch()} />
        <img src={`/change-version-${changeVersion ? "on" : "off"}.png`} width="280" className="gdButton m-1" onClick={() => { setChangeVersion(!changeVersion); saveSetVersion() }} />
        <div hidden={!changeVersion} className="mt-3 flex items-center justify-center">
          <img src="/arrow-selector.png" width="42" className={`${selectedVersion == 0 ? 'gdButton-disabled' : 'gdButton'} m-1 rotate-270`} onClick={() => selectedVersion == 0 ? null : setSelectedVersion(selectedVersion - 1)} />
          <p className="text-center text-nowrap text-2xl">Selected Version: {versionNames[selectedVersion]}</p>
          <img src="/arrow-selector.png" width="42" className={`${selectedVersion == 3 ? 'gdButton-disabled' : 'gdButton'} m-1 rotate-90`} onClick={() => selectedVersion == 3 ? null : setSelectedVersion(selectedVersion + 1)} />
        </div>
      </div>
      <div id="bottom-menu">
        <div id="left-menu">
          <img onClick={() => showWebsite()} src="/website.png" width="200" className="gdButton" />
          <img id="xps-logo" onClick={() => showDashboard()} src="/dashboard.png" width="200" className="gdButton" />
        </div>
        <div id="right-menu">
          <img onClick={() => openUrl("https://xps.lncvrt.xyz/discord")} src="/discord.png" width="80" className="gdButton" />
          <img onClick={() => openUrl("https://xps.lncvrt.xyz/twitter")} src="/twitter.png" width="80" className="gdButton" />
          <img onClick={() => openUrl("https://xps.lncvrt.xyz/youtube")} src="/youtube.png" width="80" className="gdButton" />
          <img onClick={() => openUrl("https://xps.lncvrt.xyz/twitch")} src="/twitch.png" width="80" className="gdButton" />
        </div>
      </div>
    </>
  );

  const SettingScene = () => (
    <>
      <div id="top-menu" className="relative w-full h-16 top-0">
        <img onClick={() => changeScene(0)} src="/exit.png" width="64" className="gdButton m-4 fixed left-0" />
        <img onClick={(event) => handleXpsLogoPress(event)} src={`/xps-${logoTypes[themeNum]}.png`} className="mt-10 absolute left-1/2 transform -translate-x-[40%]" />
      </div>
      <div id="toggles" className="absolute top-[20%] left-1/2 transform -translate-x-1/2 text-2xl">
        <div className="flex items-center justify-center">
          <img src={closeLauncherOnLoad ? "/enabled.png" : "/disabled.png"} className="gdButton" onClick={() => toggleCloseLauncherOnLoad()} width={42} alt="Toggle" />
          <p className="ml-2 whitespace-nowrap text-center flex-shrink-0">Close launcher on game load</p>
        </div>
        <div className="flex items-center justify-center mt-6">
          <img src={allowMultipleInstances ? "/enabled.png" : "/disabled.png"} className="gdButton" onClick={() => toggleAllowMultipleInstances()} width={42} alt="Toggle" />
          <p className="ml-2 whitespace-nowrap text-center flex-shrink-0">Allow multiple instances</p>
        </div>
        <div className="flex items-center justify-center mt-6">
          <img src={disableTransition ? "/enabled.png" : "/disabled.png"} className="gdButton" onClick={() => toggleTransition()} width={42} alt="Toggle" />
          <p className="ml-2 whitespace-nowrap text-center flex-shrink-0 mr-5">Disable transition</p>
          <img src={extraThemes ? "/enabled.png" : "/disabled.png"} className="gdButton" onClick={() => toggleExtraThemes()} width={42} alt="Toggle" />
          <p className="ml-2 whitespace-nowrap text-center flex-shrink-0">Extra Themes</p>
        </div>
      </div>
      <div id="theme-menu" className="absolute top-[45%] left-1/2 transform -translate-x-1/2">
        <div className="text-center">
          <p className="text-3xl">Themes</p>
        </div>
        <div id="colors-menu" className="flex justify-center items-center space-x-4 mt-4">
          <div className="flex flex-col items-center">
            <div className="bg-[#323232] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(0)}></div>
            <p className="mt-2 text-[18px]">Dark</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#000000] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(1)}></div>
            <p className="mt-2 text-[18px]">Amoled</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#190032] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(2)}></div>
            <p className="mt-2 text-[18px]">Purple</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#230000] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(3)}></div>
            <p className="mt-2 text-[18px]">Red</p>
          </div>
          <div className="flex flex-col items-center" hidden={!extraThemes}>
            <div className="bg-[#000855] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(4)}></div>
            <p className="mt-2 text-[18px] text-blue-500">Blue</p>
          </div>
          <div className="flex flex-col items-center" hidden={!extraThemes}>
            <div className="bg-[#1b5000] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(5)}></div>
            <p className="mt-2 text-[18px] text-blue-500">Green</p>
          </div>
          <div className="flex flex-col items-center" hidden={!extraThemes}>
            <div className="bg-[#502500] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(6)}></div>
            <p className="mt-2 text-[18px] text-blue-500">Orange</p>
          </div>
          <div className="flex flex-col items-center" hidden={!extraThemes}>
            <div className="bg-[#500045] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(7)}></div>
            <p className="mt-2 text-[18px] text-blue-500">Pink</p>
          </div>
          <div className="flex flex-col items-center absolute right-[0px] top-[160px]" hidden={!extraThemes}>
            <div className="bg-[#4b5000] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(8)}></div>
            <p className="mt-2 text-[18px] text-blue-500">Yellow</p>
          </div>
          <div className="flex flex-col items-center absolute left-[-18px] top-[160px]" hidden={!extraThemes}>
            <div className="bg-[#00408a] w-[65px] h-[65px] border-[#646464] border-1 cursor-pointer" onClick={() => setTheme(9)}></div>
            <p className="mt-2 text-[18px] text-blue-500">Light Blue</p>
          </div>
        </div>
      </div>
      <div id="setting-button-menu">
        <button className="button text-[27px]" onClick={() => openGDFolders()}>Open GD Folders</button>
        <button className="button text-[20px]" onClick={() => openAppDataFolder()}>Open AppData Folders</button>
        <button className="button text-[25px]" onClick={() => restartLauncher()}>Restart Launcher</button>
        <button className="button text-[28px]" onClick={() => resetLauncher()}>Reset Launcher</button>
      </div>
      <div id="bottom-menu" className="absolute bottom-0 left-0 m-2 mb-0.5 text-[20px]">
        <p>Launcher v{launcherVer}</p>
      </div>
    </>
  );

  return (
    <main className={`container transition-opacity duration-250 ${isFading ? "opacity-0" : "opacity-100"}`}>
      {scene === 0 ? <MainScene /> : <SettingScene />}
    </main>
  );
}
