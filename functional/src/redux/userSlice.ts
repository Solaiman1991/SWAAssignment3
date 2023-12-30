import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  username: string;
  email: string;
  name: string;
  password: string;
}

interface UserState {
  isLoggedIn: boolean;
  isRegistering: boolean;
  registrationError: string | null;
  profile: UserProfile | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  isRegistering: false,
  registrationError: null,
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action: PayloadAction<Partial<UserProfile>>) {
      state.isLoggedIn = true;
      state.profile = {...state.profile, ...action.payload};
    },
    logout(state) {
      state.isLoggedIn = false;
      state.profile = null;
    },
    startRegistration(state) {
      state.isRegistering = true;
      state.registrationError = null;
    },
    registerSuccess(state, action: PayloadAction<UserProfile>) {
      state.isRegistering = false;
      state.isLoggedIn = true;
      state.profile = action.payload;
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.isRegistering = false;
      state.registrationError = action.payload;
    },
    updateProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.profile) {
        state.profile = {...state.profile, ...action.payload};
      }
    },
    deleteUserProfile(state) {
      state.isLoggedIn = false;
      state.profile = null;
    },
  },
});

export const { login, logout, startRegistration, registerSuccess, registerFailure, updateProfile, deleteUserProfile } = userSlice.actions;
export default userSlice.reducer;
