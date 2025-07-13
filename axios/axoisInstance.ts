// utils/axiosInstance.ts
import { useAuth } from "@/components/AuthProvider";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Define a type for queue items
type FailedRequest = {
    resolve: (token: string) => void;
    reject: (error: AxiosError) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: AxiosError | null, token: string | null): void => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const useAxios = (): AxiosInstance => {
    const { refreshAccessToken, logout } = useAuth();

    const axiosInstance = axios.create({
        baseURL: "http://localhost:3000", // Replace with your API base URL
    });

    axiosInstance.interceptors.request.use(
        (config) => {
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("accessToken");
                if (token && config.headers) {
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error: AxiosError) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
        (res: AxiosResponse): AxiosResponse => res,
        async (error: AxiosError): Promise<any> => {
            const originalRequest: any = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then(token => {
                            originalRequest.headers["Authorization"] = `Bearer ${token}`;
                            return axios(originalRequest);
                        })
                        .catch(err => {
                            return Promise.reject(err);
                        });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                return new Promise(async (resolve, reject) => {
                    try {
                        const newToken = await refreshAccessToken();
                        if (originalRequest.headers) {
                            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                        }
                        processQueue(null, newToken);
                        resolve(axios(originalRequest));
                    } catch (err) {
                        processQueue(err as AxiosError, null);
                        logout();
                        reject(err);
                    } finally {
                        isRefreshing = false;
                    }
                });
            }

            return Promise.reject(error);
        }
    );

    return axiosInstance;
};
