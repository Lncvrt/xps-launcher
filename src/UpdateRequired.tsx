import "./App.css";

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());

function UpdateRequired() {
  return (
    <main className="container">
      <p>update required</p>
      <a href="https://xps.lncvrt.xyz/download/windows">click here to update</a>
    </main>
  );
}

export default UpdateRequired;
