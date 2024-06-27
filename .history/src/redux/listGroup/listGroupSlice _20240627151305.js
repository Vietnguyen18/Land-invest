import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    idGroup: null,
    idPost: null,
}


export const listGroup = createSlice({
  name: 'listgroup',
  initialState,
  reducers: {
    doGetBoxID: (state, action) => {
      state.idGroup = action.payload;
    },
    doListPost: (state, action) => {
      state.idPost = action.payload;
    }
  }
});

export const { doGetBoxID, doListPost } = listGroup.actions;

export default listGroup.reducer;