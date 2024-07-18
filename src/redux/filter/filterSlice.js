import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    house: [],
    priceOnM2: [],
    date: [],
    landArea: [],
    priceRange: [],
};

const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setFilter(state, action) {
            const { category, id } = action.payload;
            if (state[category].includes(id)) {
                state[category] = state[category].filter(item => item !== id);
            } else {
                state[category].push(id);
            }
        },
        clearFilter(state, action) {
            const { category } = action.payload;
            state[category] = [];
        },
    },
});

export const { setFilter, clearFilter } = filtersSlice.actions;

export default filtersSlice.reducer;