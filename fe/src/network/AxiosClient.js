import axios from "axios";
import { authRepository } from "../repository";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export function updateAxiosAccessToken(token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    authRepository.setAccessToken(token);
}

export default instance;
