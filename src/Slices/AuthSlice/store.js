import { api } from "../ApiSlice.js";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query";
import authSlice from "../AuthSlice/Authslice.js";

const rootReducer = combineReducers({
    [api.reducerPath]: api.reducer,
    auth: authSlice,
});

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
            },
        }).concat(api.middleware),
    devTools: true,
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export { store };
