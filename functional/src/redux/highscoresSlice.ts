import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HighscoreEntry {
  username: string;
  score: number;
}

interface HighscoreState {
  highscores: HighscoreEntry[];
}

const initialState: HighscoreState = {
  highscores: [],
};

const highscoreSlice = createSlice({
  name: 'highscores',
  initialState,
  reducers: {
    addHighscore(state, action: PayloadAction<HighscoreEntry>) {
      state.highscores.push(action.payload);
      state.highscores.sort((a, b) => b.score - a.score);
    },
  },
});

export const { addHighscore } = highscoreSlice.actions;
export default highscoreSlice.reducer;
