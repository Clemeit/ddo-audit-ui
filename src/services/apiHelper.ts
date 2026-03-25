import { API_URL } from "../constants/client.ts"
import axios from "axios"
import axiosRetry from "axios-retry"

export interface ServiceRequestProps {
    signal?: AbortSignal
}

function createAbortError(error: unknown) {
    const abortError = new Error("Request aborted")
    abortError.name = "AbortError"
    ;(abortError as Error & { cause?: unknown }).cause = error
    return abortError
}

// Configure axios to use retries
axiosRetry(axios, {
    retries: 2,
    retryDelay: (...arg) => axiosRetry.exponentialDelay(...arg, 1000),
    retryCondition(error) {
        // Retry on server errors (5xx) OR network errors (no response)
        return error.response ? error.response.status >= 500 : true
    },
})

const genericRequest = async <T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    endpoint: string,
    data?: any,
    options: {
        signal?: AbortSignal
        noRetry?: boolean
        withCredentials?: boolean
    } = {},
    version: string = "v1"
) => {
    const { signal, noRetry, ...restOptions } = options
    try {
        const axiosConfig: any = {
            method,
            url: `${API_URL}/${version}/${endpoint}`,
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
            throw createAbortError(error)
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
        withCredentials?: boolean
    } = {},
    version: string = "v1"
) => {
    return genericRequest<T>("get", endpoint, undefined, options, version)
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
        withCredentials?: boolean
    } = {},
    version: string = "v1"
) => {
    return genericRequest<T>("post", endpoint, options.data, options, version)
}

export const putRequest = async <T>(
    endpoint: string,
    options: {
        signal?: AbortSignal
        data?: any
        headers?: any
        params?: any
        noRetry?: boolean
        withCredentials?: boolean
    } = {},
    version: string = "v1"
) => {
    return genericRequest<T>("put", endpoint, options.data, options, version)
}

export const patchRequest = async <T>(
    endpoint: string,
    options: {
        signal?: AbortSignal
        data?: any
        headers?: any
        params?: any
        noRetry?: boolean
        withCredentials?: boolean
    } = {},
    version: string = "v1"
) => {
    return genericRequest<T>("patch", endpoint, options.data, options, version)
}

export const deleteRequest = async <T>(
    endpoint: string,
    options: {
        signal?: AbortSignal
        data?: any
        headers?: any
        params?: any
        noRetry?: boolean
        withCredentials?: boolean
    } = {},
    version: string = "v1"
) => {
    return genericRequest<T>("delete", endpoint, options.data, options, version)
}
