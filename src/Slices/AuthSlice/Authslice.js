// In Authslice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: null,
    refreshToken: null,
    isAuth: false, // Controlled manually
    userId: "",
    role: "",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            { payload: { accessToken, refreshToken, userId, role, isAuth } }
        ) => {
            state.token = accessToken || null;
            state.refreshToken = refreshToken || null;
            state.userId = userId || "";
            state.role = role || "";
            state.isAuth = isAuth; // Explicitly setting isAuth to true
        },
        logoutLocally: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.isAuth = false; // Reset to false on logout
            state.userId = "";
            state.role = "";
        },
    },
});

export const { setCredentials, logoutLocally } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectToken = (state) => state.auth.token;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectIsAuth = (state) => state.auth.isAuth;
export const selectUserId = (state) => state.auth.userId;
export const selectUserRole = (state) => state.auth.role;
