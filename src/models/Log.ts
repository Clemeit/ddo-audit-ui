interface LogRequest {
    message: string;
    level: "debug" | "info" | "warn" | "error" | "fatal";
    timestamp?: string; // ISO 8601 format
    session_id?: string;
    user_id?: string;
    user_agent?: string;
    browser?: string;
    browser_version?: string;
    os?: string;
    screen_resolution?: string;
    viewport_size?: string;
    url: string;
    page_title?: string;
    referrer?: string;
    route?: string;
    component?: string;
    action?: string;
    ip_address?: string;
    country?: string;
}

export { LogRequest };