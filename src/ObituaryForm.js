import React, { useState } from "react";
import App from "./App";

function ObituaryForm() {
  const [name, setName] = useState("");
  const [picture, setPicture] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handlePictureChange = (event) => {
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
    if (!name || !picture || !dateOfBirth || !dateOfDeath) {
      alert("Please fill out all fields.");
      return;
    }
    setIsSubmitting(true);
    // Call API to generate obituary
    try {
      const response = await fetch("your-api-endpoint", {
        method: "POST",
        body: new FormData(event.target),
      });
      // Handle response
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div class="overlay">
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
      <input type="text" id="name" value={name} onChange={handleNameChange} />
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
