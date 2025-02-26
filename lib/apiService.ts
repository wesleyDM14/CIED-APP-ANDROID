import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const APP_SECRET_KEY = process.env.EXPO_PUBLIC_API_KEY;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        "x-api-key": APP_SECRET_KEY,
    },
});

export default api;