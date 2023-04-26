import React, { useState } from "react";
import App from "./App";

function ObituaryForm({ onClose, obituaries, setObituaries }) {
  const [name, setName] = useState("");
  const [picture, setPicture] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  
  const handlePictureChange = (event) => {
    console.log(event.target.files)
    setPicture(event.target.files[0]);
  };

  const handleDateOfBirthChange = (event) => {
    setDateOfBirth(event.target.value);
  };

  const handleDateOfDeathChange = (event) => {
    setDateOfDeath(event.target.value);
  };

const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(name, picture, dateOfBirth, dateOfDeath)

    if (!name || !picture || !dateOfBirth || !dateOfDeath) {
      alert("Please fill out all fields.");
      return;
    }
    setIsSubmitting(true);
  
    // finding max id in the obituaries list and incrementing it by one for the new id
    const maxID = obituaries.reduce((max, obituary) => Math.max(max, parseInt(obituary.id)), 0);
    const newID = (maxID + 1);
    console.log("id: " + newID)

    const formData = new FormData();
    formData.append('picture', picture);
    formData.append('name', name);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('dateOfDeath', dateOfDeath);
    formData.append('id', newID);
  
    try {
      // backend communication
      const response = await fetch("https://ht6w6tvvhmpn7fjslem7k7hziu0lzbcr.lambda-url.ca-central-1.on.aws/", {
        method: "POST",
        body: formData
      });
      console.log(response);

      const data = await response.json();
      const savedObituary = data.item;
      // setObituaries((prevObituaries) => [...prevObituaries, savedObituary]);
      onClose(savedObituary); // Pass the saved obituary object to onClose function

    } catch (error) {
      alert("Unable to generate obituary.");
      console.log(error);
    } finally {
      setIsSubmitting(false);
      console.log("submitted");
    }
  };

  return (
  <div className="overlay">
  <div className="form-container">
  <form className="obituary-form">
    <button id="close-button" onClick={App.handleCloseModal}>
      X
    </button>
    <h2>Create a New Obituary</h2>

    <div className="flowers">
        <img src="https://www.filepicker.io/api/file/CgtL9WUYQsasouSqXWtx" alt="Flowers" width="200" height="50"/>
    </div>

    <div>
      <label htmlFor="name">Name: </label> 
      <input type="text" placeholder="Ex. King Mufasa" id="name" value={name} onChange={handleNameChange} />
    </div>

    <div>
      <label htmlFor="picture">Picture: </label>
      <input type="file" id="picture" onChange={handlePictureChange} />
    </div>

    <div>
    <label htmlFor="dateOfBirth">Date of Birth: </label>
      <input
        type="datetime-local"
        id="dateOfBirth"
        value={dateOfBirth}
        onChange={handleDateOfBirthChange}
      />
    </div>

    <div>
    <label htmlFor="dateOfDeath">Date of Death: </label>
      <input
        type="datetime-local"
        id="dateOfDeath"
        value={dateOfDeath}
        onChange={handleDateOfDeathChange}
      />
    </div>

    <div className="form-input">
      <button id="submit-button" type="submit" disabled={isSubmitting} onClick={handleSubmit}>
        {isSubmitting ? "Generating Obituary..." : "Generate Obituary"}
      </button>
    </div>

  </form>
  </div>
  </div>
  );
}

export default ObituaryForm;
