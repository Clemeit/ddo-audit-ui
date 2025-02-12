import { API_URL, API_VERSION } from "../constants/client.ts"
import axios from "axios"
import axiosRetry from "axios-retry"

// Configure axios to use retries
axiosRetry(axios, {
    retries: 3,
    retryDelay: (...arg) => axiosRetry.exponentialDelay(...arg, 1000),
    retryCondition(error) {
        return error.response ? error.response.status >= 500 : false
    },
})

// Function to make GET requests
export const getRequest = async <T>(endpoint: string, params = {}) => {
    try {
        const response = await axios.get<T>(
            `${API_URL}/${API_VERSION}/${endpoint}`,
            { params }
        )
        return response.data
    } catch (error) {
        console.error("GET request failed:", error)
        throw error
    }
}

// Function to make POST requests
export const postRequest = async <T>(endpoint: string, data = {}) => {
    try {
        const response = await axios.post<T>(
            `${API_URL}/${API_VERSION}/${endpoint}`,
            data
        )
        return response.data
    } catch (error) {
        console.error("POST request failed:", error)
        throw error
    }
}
