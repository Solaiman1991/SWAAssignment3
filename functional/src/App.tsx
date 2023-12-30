import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GamePage from './components/GamePage';
import LoginPage from './components/LoginPage';
import NavBar from './components/NavBar';
import UserProfilePage from './components/UserProfilePage';
import { RootState } from './redux/store';
import { setGameBoard } from './redux/gameSlice';
import HighscorePage from './components/HighScorePage';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const gameBoard = useSelector((state: RootState) => state.gameSlice.board);
  const selectedTiles = useSelector((state: RootState) => state.gameSlice.selectedTiles);
  const isLoggedIn = useSelector((state: RootState) => state.userSlice.isLoggedIn);

  useEffect(() => {
    dispatch(setGameBoard());
  }, [dispatch]);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/highScores" element={<HighscorePage />} />
        <Route path="/profile" element={isLoggedIn ? <UserProfilePage /> : <Navigate to="/login" />} />
        <Route path="/game" element={ isLoggedIn ? (
            <GamePage
              board={gameBoard}
              selectedPositions={selectedTiles}
            />
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
};

export default App;
