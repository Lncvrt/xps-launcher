import "./App.css";

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());

function Loading() {
  return (
    <main className="container">
      <p>loading</p>
    </main>
  );
}

export default Loading;
