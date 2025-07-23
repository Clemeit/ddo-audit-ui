import { API_URL, API_VERSION } from "../constants/client.ts"
import axios from "axios"
import axiosRetry from "axios-retry"

export interface ServiceRequestProps {
    signal?: AbortSignal
}

// Configure axios to use retries
axiosRetry(axios, {
    retries: 5,
    retryDelay: (...arg) => axiosRetry.exponentialDelay(...arg, 1000),
    retryCondition(error) {
        // Retry on server errors (5xx) OR network errors (no response)
        return error.response ? error.response.status >= 500 : true
    },
})

const genericRequest = async <T>(
    method: "get" | "post",
    endpoint: string,
    data?: any,
    options: { signal?: AbortSignal } = {}
) => {
    const { signal, ...restOptions } = options
    try {
        const response = await axios({
            method,
            url: `${API_URL}/${API_VERSION}/${endpoint}`,
            data,
            ...restOptions,
            signal,
        })
        return response.data as T
    } catch (error) {
        console.error(`${method.toUpperCase()} request failed:`, error)
        throw error
    }
}

// Function to make GET requests
export const getRequest = async <T>(
    endpoint: string,
    options: {
        signal?: AbortSignal
        data?: any
        headers?: any
        params?: any
    } = {}
) => {
    return genericRequest<T>("get", endpoint, undefined, options)
}

// Function to make POST requests
export const postRequest = async <T>(
    endpoint: string,
    options: {
        signal?: AbortSignal
        data?: any
        headers?: any
        params?: any
    } = {}
) => {
    return genericRequest<T>("post", endpoint, options.data, options)
}
