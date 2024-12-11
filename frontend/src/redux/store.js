import {configureStore} from '@reduxjs/toolkit'
import boardReducer from './boardSlice.js'
const store = configureStore({
    reducer: {
        'board': boardReducer,
    }
})

export default store;