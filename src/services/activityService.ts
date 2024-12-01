import axios from "axios"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/activity"

function getCharacterLocationActivityById(
    id: string,
    start_date: string,
    end_date: string,
    limit: number
) {
    return axios.get(
        `${API_URL}/${id}/location?start_date=${start_date}&end_date=${end_date}&limit=${limit}`
    )
}

export { getCharacterLocationActivityById }
