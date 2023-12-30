import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import './HighscorePage.css'; 

const HighscorePage = () => {
  const highscores = useSelector((state: RootState) => state.highscoreSlice.highscores); // Adjust this according to your actual state structure

  return (
    <div className="highscore-container">
      <h2 className="highscore-title">Highscores</h2>
      <ul className="highscore-list">
        {highscores.map((entry, index) => (
          <li key={index} className="highscore-item">
            {entry.username}: {entry.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HighscorePage;
