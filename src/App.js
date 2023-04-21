import { useState } from "react";
import ObituaryForm from "./ObituaryForm";

function App() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div id="container">
      <header>
        <aside>
          <button id="menu-button" onClick={handleOpenModal}>
            + New Obituary
          </button>
        </aside>
        <div id="app-header">
          <h1>The Last Show</h1>
        </div>
        <aside>&nbsp;</aside>
      </header>

      {showModal && (
        <div id="modal">
          <div id="modal-content">
            {/* <button id="close-button" onClick={handleCloseModal}>
              X
            </button> */}
            <ObituaryForm onClose={handleCloseModal}/>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

