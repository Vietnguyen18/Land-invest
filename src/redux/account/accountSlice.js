import {createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  Users: 
  {
    Username:"",
    FullName:"",
    Password:"",
    Gender:"",
    Latitude: null,
    Longitude: null,
    avatarLink: null,
    Email:"",
    LastLoginIP:""
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
      state.dataUser = action.payload;
    },

    doLGetAccountAction: (state, action) => {
      state.isAuthenticated = true;
      state.Users = action.payload.Users;
    },

    doLogoutAction: (state) => {
      state.isAuthenticated = false;
      state.Users = {
        Username: "",
        FullName: "",
        Password: "",
        Gender: "",
        Latitude: null,
        Longitude: null,
        avatarLink: null,
        Email: "",
        LastLoginIP: ""
      };
      state.dataUser = {}; // Reset to empty object instead of null
    },

    doLoginDataUser: (state, action) => {
      state.dataUser = action.payload;
    },
  },
  extraReducers: (builder) => {},
});

export const { doLoginAction, doLGetAccountAction, doLogoutAction, doLoginDataUser } = accountSlice.actions;

export default accountSlice.reducer;