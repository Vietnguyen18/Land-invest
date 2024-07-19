import { createSlice } from '@reduxjs/toolkit';

const mapSlice = createSlice({
    name: 'map',
    initialState: {
        data: null,
    },
    reducers: {
        setMapData: (state, action) => {
            state.data = action.payload;
        },
    },
});

export const { setMapData } = mapSlice.actions;
export default mapSlice.reducer;
