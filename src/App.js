import { useState } from "react";


function App() {
  const [collapse, setCollapse] = useState(false);
  return (
    <div id="container">
      <header>
        <aside>
          <button id="menu-button" onClick={() => setCollapse(!collapse)}>
            + New Obituary
          </button>
        </aside>
        <div id="app-header">
          <h1>
            The Last Show
          </h1>
        </div>
        <aside>&nbsp;</aside>
      </header>
    </div>
  );

}

export default App;
