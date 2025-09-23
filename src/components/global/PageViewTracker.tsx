import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { trackPageView, gaReady } from "../../utils/analytics"

declare global {
    interface Window {
        gtag?: (...args: any[]) => void
    }
}

export function PageViewTracker() {
    const location = useLocation()
    const lastPathRef = useRef<string | null>(null)

    useEffect(() => {
        const fullPath = location.pathname + location.search
        if (lastPathRef.current === fullPath) return
        lastPathRef.current = fullPath

        // delay to ensure title and other metadata are updated (Helmet)
        const timer = setTimeout(() => {
            if (gaReady()) {
                trackPageView(fullPath)
            }
        }, 0)

        return () => clearTimeout(timer)
    }, [location])

    return null
}

export default PageViewTracker
