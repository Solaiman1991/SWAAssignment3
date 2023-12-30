import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import userReducer from './userSlice';
import highScoresReducer from './highscoresSlice';


const store = configureStore({
  reducer: {
    gameSlice: gameReducer,
    userSlice: userReducer,
    highscoreSlice: highScoresReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;