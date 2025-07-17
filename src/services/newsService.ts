import axios from "axios"
import { NewsResponse } from "../models/Service.ts"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/service/news"

function getNews(): Promise<Record<string, NewsResponse>> {
    return axios.get(API_URL)
}

export { getNews }
