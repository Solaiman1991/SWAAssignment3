import React, { useEffect } from 'react';
import { Board, Position, piece, canMove as boardCanMove } from '../util/board';
import './GamePage.css';
import { RootState } from '../redux/store';
import { resetGame, setHighscoreRecorded, selectTile, unselectTile, moveTiles, incrementMoves } from '../redux/gameSlice';
import { addHighscore } from '../redux/highscoresSlice';
import { useDispatch, useSelector } from 'react-redux';

type GameBoardProps<T> = {
  board: Board<T> | undefined;
  selectedPositions?: Position[];
};

const GamePage = <T extends string>({ board, selectedPositions = [] }: GameBoardProps<T>) => {
  const dispatch = useDispatch();
  const score = useSelector((state: RootState) => state.gameSlice.score);
  const moves = useSelector((state: RootState) => state.gameSlice.moves);
  const username = useSelector((state: RootState) => state.userSlice.profile?.username);
  const highscoreRecorded = useSelector((state: RootState) => state.gameSlice.highscoreRecorded);

  const movesLeft = 5;
  const isGameOver = moves >= movesLeft;

  const handleNewGame = () => {
    dispatch(resetGame());
  };

  const handleTileClick = (position: Position) => {
    if (!isGameOver) {
      const isSelected = selectedPositions.some(p => p.row === position.row && p.col === position.col);

      if (isSelected) {
        dispatch(unselectTile(position));
      } else {
        dispatch(selectTile(position));

        if (selectedPositions.length === 1) {
          const firstSelectedTile = selectedPositions[0];
          if (boardCanMove(board, firstSelectedTile, position)) {
            dispatch(moveTiles({ first: firstSelectedTile, second: position }));
            dispatch(incrementMoves());
          }
        }
      }
    }
  };

  useEffect(() => {
    if (isGameOver && !highscoreRecorded && username) {
      dispatch(addHighscore({ username, score }));
      dispatch(setHighscoreRecorded(true));
    }
  }, [isGameOver, highscoreRecorded, username, score, dispatch]);

  if (!board) {
    return <div>Loading board...</div>;
  }

  return (
    <div className="game-container">
      {username && <h2 className="welcome">Welcome {username}</h2>}
      <div className="score-moves-container">
        <div className="score-label">Score:</div>
        <div className="score-value">{score}</div>
      </div>
      <div className="score-moves-container">
        <div className="moves-label">Moves Left:</div>
        <div className="moves-value">{movesLeft - moves}</div>
      </div>

      <table className="gameBoardTable">
        <tbody>
          {Array.from({ length: board.height }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: board.width }, (_, col) => {
                const position = { row, col };
                const tileValue = piece(board, position);
                const cellClass = selectedPositions.some(p => p.row === position.row && p.col === position.col) ? "gameBoardCellSelected" : "";
                return (
                  <td
                    key={`${row}-${col}`}
                    className={`gameBoardCell ${cellClass}`}
                    onClick={() => handleTileClick(position)}
                  >
                    {tileValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {isGameOver && (
        <div className="game-over">
          <p>Game Over. You've reached the maximum number of moves.</p>
          <p>Your game score is {score}</p>
          <button className="new-game-button" onClick={handleNewGame}>
            New Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
