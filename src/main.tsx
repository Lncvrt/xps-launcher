import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import UpdateRequired from "./UpdateRequired";
import Loading from "./Loading";
import { invoke } from "@tauri-apps/api/core";

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
