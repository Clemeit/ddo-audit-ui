interface FeedbackMessage {
    message: string
    contact?: string
    user_id?: string
    session_id?: string
    commit_hash?: string
}

interface FeedbackEndpointResponse {
    data: {
        ticket: string
    }
}

export type { FeedbackMessage, FeedbackEndpointResponse }
