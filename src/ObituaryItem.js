import { useState } from "react";
import FormattedDate from './FormattedDate';

function ObituaryItem({ obituary, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const formattedBornDate = FormattedDate(obituary.born);
  const formattedDiedDate = FormattedDate(obituary.died);
  const formattedDateRange = `${formattedBornDate} - ${formattedDiedDate}`;

  const handlePlayPause = () => {
    const audioElement = document.getElementById("audioElement");
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="obituary-container">
      <div className="obituary-content">
        <img src={obituary.image_url} alt={obituary.name} />
        <h2>{obituary.name}</h2>

        <div className="date-container">
          <p>{formattedDateRange}</p>
        </div>

        <button id="drop-down" onClick={handleToggleExpand}>
          {isExpanded ? <span>&#x25B2;</span> : <span>&#x25BC;</span>}
        </button>

        {isExpanded && (
          <>
            <div id="description">
              <p>{obituary.description}</p>
            </div>
            <audio id="audioElement" src={obituary.polly_url}></audio>
            <button
              id="playPauseBtn"
              className={isPlaying ? "pause" : "play"}
              onClick={handlePlayPause}
            ></button>
          </>
        )}
      </div>
    </div>
  );
}

export default ObituaryItem;

