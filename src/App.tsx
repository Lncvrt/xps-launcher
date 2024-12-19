import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());

function App() {
  const [result, setResult] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number>(0);

  async function launch() {
    setResult(await invoke("launch", { ver: selectedVersion }));
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVersion(Number(event.target.value));
  };

  return (
    <main className="container">
      <div id="top-bar" className="relative w-full h-16 top-0">
        <img src="/close.png" width="96" className="m-2 fixed left-0 cursor-pointer" />
        <img src="/settings.png" width="96" className="m-2 fixed right-0" />
      </div>
      <div id="launch-menu" className="absolute top-[15%] left-1/2 transform -translate-x-1/2">
        <img src="/launch.png" width="180" className="m-1 cursor-pointer" onClick={launch} />
          <div className="dropdown-container">
            <select className="dropdown" onChange={handleChange}>
              <option value="0">2.2</option>
              <option value="1">2.1</option>
              <option value="2">2.0</option>
              <option value="3">1.9</option>
            </select>
          </div>
          <p>{result}</p>
      </div>
      <div id="bottom-bar">
        <div id="right-bar">
          <a href="https://xps.lncvrt.xyz/discord" target="_blank"><img src="/discord.png" width="80" /></a>
          <a href="https://xps.lncvrt.xyz/twitter" target="_blank"><img src="/twitter.png" width="80" /></a>
          <a href="https://xps.lncvrt.xyz/youtube" target="_blank"><img src="/youtube.png" width="80" /></a>
          <a href="https://xps.lncvrt.xyz/twitch" target="_blank"><img src="/twitch.png" width="80" /></a>
        </div>
      </div>
    </main>
  );
}

export default App;
