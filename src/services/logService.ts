import axios from "axios"
import { LogRequest } from "../models/Log.ts"

const LOG_URL = "https://api.hcnxsryjficudzazjxty.com/v1/service/log"

function postLog(log: LogRequest) {
    return axios.post(
        LOG_URL,
        log,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    )
}


export {
    postLog,
}
