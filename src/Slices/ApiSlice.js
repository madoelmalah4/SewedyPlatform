import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { REHYDRATE } from "redux-persist";
import { logoutLocally, setCredentials } from "../Slices/AuthSlice/Authslice.js";


const baseQuery = fetchBaseQuery({
    baseUrl: "https://sewedy-platform1.runasp.net",
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const refreshBaseQuery = fetchBaseQuery({
    baseUrl: "https://sewedy-platform1.runasp.net",
    prepareHeaders: (headers, { getState }) => {
        const refreshToken = getState().auth.refreshToken;
        if (refreshToken) {
            headers.set("authorization", `Bearer ${refreshToken}`);
        }
        // headers.set("Content-Type", "application/json");
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result?.error?.status === 401) {
        const refreshResult = await refreshBaseQuery(
            { url: "auth/refresh", method: "POST" },
            api,
            extraOptions
        );
        if (refreshResult?.data) {
            const isAuth = api.getState().auth.isAuth;
            // store the new token & refresh token
            api.dispatch(setCredentials({ ...refreshResult.data }));
            // retry the original query with the new token
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logoutLocally());
            // redirect to '/' if refresh token is invalid
            // window.location.href = "/";
        }
    }
    return result;
};

export const api = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["department", "product", "orders"],
    extractRehydrationInfo(action, { reducerPath }) {
        // when persisting the root reducer
        if (action.type === REHYDRATE && action.payload) {
            // @ts-ignore
            return action.payload[reducerPath];
        }

        // when persisting the api reducer
        if (
            action.type === REHYDRATE &&
            action.key === "key used with redux-persist" &&
            action.payload
        ) {
            return action.payload;
        }
    },
    endpoints: (builder) => ({}),
});
