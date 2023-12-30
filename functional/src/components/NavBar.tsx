import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <Link className="nav-link" to="/login">Login / Create User</Link>
      <Link className="nav-link" to="/game">Game</Link>
      <Link className="nav-link" to="/profile">Profile</Link>
      <Link className="nav-link" to="/highScores">HighScores</Link>

    </nav>
  );
};

export default NavBar;
