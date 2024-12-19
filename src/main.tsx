import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import UpdateRequired from "./UpdateRequired";
import Loading from "./Loading";
import { invoke } from "@tauri-apps/api/core";

function Root() {
  const [isVersionValid, setIsVersionValid] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkVersion() {
      const result = await invoke("check_version") as boolean;
      setIsVersionValid(result);
    }

    checkVersion();
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
