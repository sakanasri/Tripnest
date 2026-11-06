import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8081",
});

// Automatically attach JWT token to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Automatically handle 401 Unauthorized / Expired sessions
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/" && window.location.pathname !== "/signup") {
                window.location.href = "/?session=expired";
            }
        }
        return Promise.reject(error);
    }
);

export default API;