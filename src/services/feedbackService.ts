import axios from "axios"
import { FeedbackMessage } from "../models/Feedback.ts"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/service/feedback"

function postFeedback(feedback: FeedbackMessage) {
    return axios.post(
        API_URL,
        feedback,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    )
}


export {
    postFeedback,
}
