// utils/tokenUtils.js
import jwt_decode from "jwt-decode";

export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const { exp } = jwt_decode(token); // exp is in seconds
        return Date.now() >= exp * 1000;
    } catch (e) {
        return true;
    }
};
