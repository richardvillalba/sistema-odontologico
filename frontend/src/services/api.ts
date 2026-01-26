import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Get API URL from env or default to localhost proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create Axios Instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        // TODO: Add Auth Token here when authentication is implemented
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        // Handle global errors (401, 403, 500)
        if (error.response) {
            if (error.response.status === 401) {
                console.error('Unauthorized access');
                // Redirect to login if needed
            }
        }
        return Promise.reject(error);
    }
);

export default api;
