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
    options: { signal?: AbortSignal; noRetry?: boolean } = {}
) => {
    const { signal, noRetry, ...restOptions } = options
    try {
        const axiosConfig: any = {
            method,
            url: `${API_URL}/${API_VERSION}/${endpoint}`,
            data,
            ...restOptions,
            signal,
        }
        if (noRetry) {
            axiosConfig["axios-retry"] = { retries: 0 }
        }
        const response = await axios(axiosConfig)
        return response.data as T
    } catch (error) {
        if (!signal?.aborted) {
            console.error(`${method.toUpperCase()} request failed:`, error)
            throw error
        } else {
            console.warn(`${method.toUpperCase()} request aborted:`, error)
            return null // TODO: Is this legit?
        }
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
        noRetry?: boolean
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
        noRetry?: boolean
    } = {}
) => {
    return genericRequest<T>("post", endpoint, options.data, options)
}
