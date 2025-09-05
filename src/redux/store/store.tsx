import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import editorReducer from '../slices/editorSlice';
import authReducer from '../slices/authSlice';
import { authApi } from '../api/authApi';
import { editorApi } from '../api/editorApi';

const rootReducer = combineReducers({
  editor: editorReducer,
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [editorApi.reducerPath]: editorApi.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, editorApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export default store;
