import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  Users: {
    Username: "",
    FullName: "",
    Password: "",
    Gender: "Nam",
    Latitude: 10.54,
    Longitude: 20.435,
    avatarLink: null,
    Email: "",
    LastLoginIP: "127.0.0.1"
  },
  dataUser: {}
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    doLoginAction: (state, action) => {
      state.isAuthenticated = true;
      state.Users = action.payload;
    },
    doGetAccountAction: (state, action) => {
      state.isAuthenticated = true;
      state.Users = action.payload.Users;
    },
    doLogoutAction: (state) => {
      state.isAuthenticated = false;
      state.Users = initialState.Users;
      state.dataUser = {};
    },
    doLoginDataUser: (state, action) => {
      state.dataUser = action.payload;
    }
  }
});

export const { doLoginAction, doGetAccountAction, doLogoutAction, doLoginDataUser } = accountSlice.actions;

export default accountSlice.reducer;
