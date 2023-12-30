import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Board, Position, create as createBoard, move, canMove, Match, Generator } from '../util/board';
import { SequenceGenerator } from '../util/SequenceGenerator';

// Function to initialize the game board
const initializeBoard = (): Board<string> => {
  const generator: Generator<string> = new SequenceGenerator("ABAC");
  return createBoard(generator, 6, 6);
};

// Game state interface
interface GameState {
  board: Board<string>;
  selectedTiles: Position[];
  messages: string[];
  score: number;
  moves: number; 
  highscoreRecorded: boolean,
}

// Initial state of the game
const initialState: GameState = {
  board: initializeBoard(),
  selectedTiles: [],
  messages: [],
  score: 0,
  moves: 0,
  highscoreRecorded: false,
};

// Slice to handle game-related state and actions
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Set or reset the game board
    setGameBoard(state) {
      state.board = initializeBoard();
    },

    // Increment the score
    incrementScore(state) {
      state.score += 1;
    },

    // Increment the number of moves
    incrementMoves(state) {
      state.moves += 1;
    },

    // Reset the number of moves
    resetMoves(state) {
      state.moves = 0;
    },

    // Set highscore recorded flag
    setHighscoreRecorded(state, action: PayloadAction<boolean>) {
      state.highscoreRecorded = action.payload;
    },

    // Select a tile
    selectTile(state, action: PayloadAction<Position>) {
      const position = action.payload;
      const isAlreadySelected = state.selectedTiles.some(p => p.row === position.row && p.col === position.col);

      if (!isAlreadySelected) {
        state.selectedTiles.push(position);

        if (state.selectedTiles.length === 2) {
          const [first, second] = state.selectedTiles;
          if (canMove(state.board, first, second)) {
            const generator: Generator<string> = new SequenceGenerator("ABAC");
            const moveResult = move(generator, state.board, first, second);
            state.board = moveResult.board;

            moveResult.effects.forEach(effect => {
              if (effect.kind === 'Match') {
                const message = convertMatchToString(effect.match);
                state.messages.push(message);
                state.score += 1;
              }
            });
          }
          state.selectedTiles = [];
        }
      } else {
        state.selectedTiles = state.selectedTiles.filter(p => p.row !== position.row || p.col !== position.col);
      }
    },

    // Unselect a tile
    unselectTile(state, action: PayloadAction<Position>) {
      const position = action.payload;
      state.selectedTiles = state.selectedTiles.filter(p => p.row !== position.row || p.col !== position.col);
    },

    // Logic to handle tile movements
    moveTiles(state, action: PayloadAction<{ first: Position; second: Position }>) {
      const { first, second } = action.payload;
      if (canMove(state.board, first, second)) {
        const generator: Generator<string> = new SequenceGenerator("ABAC");
        const moveResult = move(generator, state.board, first, second);
        state.board = moveResult.board;
        moveResult.effects.forEach(effect => {
          if (effect.kind === 'Match') {
            const message = convertMatchToString(effect.match);
            state.messages.push(message);
            state.score += 1;
          }
        });
      }
    },

    // Add a message to the game state
    addMessage(state, action: PayloadAction<string>) {
      state.messages.push(action.payload);
    },

    // Reset the entire game state
    resetGame(state) {
      state.board = initializeBoard();
      state.selectedTiles = [];
      state.messages = [];
      state.score = 0;
      state.moves = 0;
      state.highscoreRecorded = false;
    },
  },
});

export const { 
  setGameBoard, selectTile, unselectTile, moveTiles, addMessage, resetGame, 
  incrementScore, incrementMoves, resetMoves, setHighscoreRecorded 
} = gameSlice.actions;

export default gameSlice.reducer;

// Helper function to convert match information to string
function convertMatchToString<T>(match: Match<T>): string {
  return `Match: ${match.matched} at positions...`;
}