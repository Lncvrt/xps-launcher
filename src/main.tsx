import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import UpdateRequired from "./UpdateRequired";
import Loading from "./Loading";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { getBackgroundColor } from "./lib/config";

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());

function Root() {
  const [isVersionValid, setIsVersionValid] = useState<boolean | null>(null);
  const hasCheckedVersion = useRef(false);

  useEffect(() => {
    if (!hasCheckedVersion.current) {
      hasCheckedVersion.current = true;
      (async () => {
        const result = (await invoke("check_version")) as boolean;
        setIsVersionValid(result);
      })();
    }
  }, []);

  if (isVersionValid === null) {
    return <Loading />;
  }

  return isVersionValid ? <App /> : <UpdateRequired />;
}

const setBgColor = async () => {
  const bgcolor = `bg-[#${await getBackgroundColor()}]`;

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <div className={`${bgcolor} w-screen h-screen`} id="main-section">
        <Root />
      </div>
    </React.StrictMode>
  );
}

setBgColor();