interface FeedbackMessage {
    message: string
    contact?: string
}

interface FeedbackEndpointResponse {
    data: {
        ticket: string
    }
}

export type { FeedbackMessage, FeedbackEndpointResponse }
