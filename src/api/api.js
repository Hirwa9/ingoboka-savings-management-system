import axios from "axios";

export const BASE_URL = process.env.REACT_APP_BASE_URL;

export const Axios = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Allows sending cookies and auth headers
});