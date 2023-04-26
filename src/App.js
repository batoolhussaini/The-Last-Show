import { useEffect, useState } from "react";
import ObituaryForm from "./ObituaryForm";
import Obituaries from "./Obituaries";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [obituaries, setObituaries] = useState([]); // used for keeping track of all obituaries (connected to backend)
  const [showDefault, setShowDefault] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = (newObituary) => {
    setShowModal(false);
    if (newObituary) {
      saveObituary(newObituary); // save obituary to list
    }
  };

  const saveObituary = (newObituary) => {
    const { id, name, born, died, description, image_url, polly_url } = newObituary;
    const obituary = {
      id: id,
      name: name,
      born: born,
      died: died,
      description: description,
      image_url: image_url,
      polly_url: polly_url,
    };
    console.log("New Obituary Object:", obituary);
    setObituaries((prevObituaries) => [...prevObituaries, obituary]);
    setShowDefault(true);
    console.log("Obituaries Array:", obituaries);
  };

  const getObituaries = async () => {
    try {
      // backend communication
      const response = await fetch(
        "https://mbstos3kece2oc4aat3owe7xfy0xemeo.lambda-url.ca-central-1.on.aws/",
        {
          method: "GET"
        });
      const data = await response.json();
      setObituaries(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getObituaries();
  }, []);

  return (
    <div id="container">
      <header>
        <aside>
          <button id="menu-button" onClick={handleOpenModal}>
            + New Obituary
          </button>
        </aside>
        <div id="app-header">
          <h1>The Last Show&ensp;&nbsp;</h1>
        </div>
        <aside>&nbsp;</aside>
      </header>

      <div id="main">
        <Obituaries obituaries={obituaries} showDefault={showDefault} /> {/* shows all obituaries with default of closed description */}
      </div>

      {showModal && (
        <div id="modal">
          <div id="modal-content">
            {/* <button id="close-button" onClick={handleCloseModal}>
              X
            </button> */}
            {/* when adding a new obituary the default is to show description + audio */}
            <ObituaryForm onClose={handleCloseModal} obituaries = {obituaries} setObituaries={setObituaries} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

