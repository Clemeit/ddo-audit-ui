import { postLog } from "../services/logService.ts";
import { LogRequest } from "../models/Log.ts";

// Utility function to detect browser name and version
function getBrowserInfo(): { browser?: string; browser_version?: string } {
    const userAgent = navigator.userAgent;
    let browser: string | undefined;
    let browser_version: string | undefined;

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
        browser_version = match ? match[1] : undefined;
    } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
        browser_version = match ? match[1] : undefined;
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
        const match = userAgent.match(/Version\/(\d+\.\d+)/);
        browser_version = match ? match[1] : undefined;
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
        const match = userAgent.match(/Edg\/(\d+\.\d+)/);
        browser_version = match ? match[1] : undefined;
    }

    return { browser, browser_version };
}

// Utility function to detect operating system
function getOperatingSystem(): string | undefined {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return undefined;
}

// Utility function to get screen and viewport information
function getScreenInfo(): { 
    screen_resolution?: string; 
    viewport_size?: string; 
} {
    const screen_resolution = screen.width && screen.height 
        ? `${screen.width}x${screen.height}` 
        : undefined;
    
    const viewport_size = window.innerWidth && window.innerHeight 
        ? `${window.innerWidth}x${window.innerHeight}` 
        : undefined;

    return { screen_resolution, viewport_size };
}

// Utility function to generate a session ID (persisted in sessionStorage)
function getSessionId(): string {
    let sessionId = sessionStorage.getItem('ddo_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('ddo_session_id', sessionId);
    }
    return sessionId;
}

// Utility function to generate a session ID (persisted in sessionStorage)
function getUserId(): string {
    let userId = localStorage.getItem('ddo_user_id');
    if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('ddo_user_id', userId);
    }
    return userId;
}

// Utility function to get route information
function getRouteInfo(): { route?: string; page_title?: string } {
    const route = window.location.pathname;
    const page_title = document.title || undefined;
    
    return { route, page_title };
}

// Utility function to log messages
export default function logMessage(
    message: string,
    level: "debug" | "info" | "warn" | "error" | "fatal",
    action?: "click" | "submit" | "view" | "navigate",
    additionalData: Partial<LogRequest> = {}
): void {
    const { browser, browser_version } = getBrowserInfo();
    const os = getOperatingSystem();
    const { screen_resolution, viewport_size } = getScreenInfo();
    const session_id = getSessionId();
    const { route, page_title } = getRouteInfo();
    const user_id = getUserId();

    const logEntry: LogRequest = {
        message,
        level,
        timestamp: new Date().toISOString(),
        session_id,
        user_id,
        user_agent: navigator.userAgent,
        browser,
        browser_version,
        os,
        screen_resolution,
        viewport_size,
        url: window.location.href,
        page_title,
        referrer: document.referrer || undefined,
        route,
        action,
        ...additionalData,
    };

    postLog(logEntry)
        .catch((error) => {
            console.error("Failed to log message:", error);
        });
}