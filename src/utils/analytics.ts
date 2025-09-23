// Centralized GA utilities to ensure consistent event structure and easier debugging

declare global {
    interface Window {
        gtag?: (...args: any[]) => void
    }
}

interface GAEventParams {
    [key: string]: any
    page_path?: string
    page_title?: string
    page_location?: string
}

const MEASUREMENT_ID = "G-YG3R94WB3B" // TODO: move to env variable for multi-env builds

export function gaReady() {
    return typeof window !== "undefined" && typeof window.gtag === "function"
}

export function trackEvent(eventName: string, params: GAEventParams = {}) {
    if (!gaReady()) return
    // Ensure we don't accidentally mutate caller object
    const payload = { ...params }
    if (!("send_to" in payload)) {
        // Explicitly route to our measurement ID in case multiple configs are present
        payload.send_to = MEASUREMENT_ID
    }
    window.gtag!("event", eventName, payload)
}

export function trackPageView(path: string) {
    trackEvent("page_view", {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
    })
}

export function setUserId(userId?: string) {
    if (!userId || !gaReady()) return
    window.gtag!("config", MEASUREMENT_ID, { user_id: userId })
}

export function setUserProperties(props: Record<string, any>) {
    if (!gaReady()) return
    window.gtag!("set", "user_properties", props)
}

export default { trackEvent, trackPageView, setUserId, setUserProperties }
