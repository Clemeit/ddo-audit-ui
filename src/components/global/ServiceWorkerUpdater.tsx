import { useEffect } from "react"
import { useServiceWorkerUpdate } from "../../hooks/useServiceWorkerUpdate"
import * as serviceWorkerRegistration from "../../serviceWorkerRegistration"

export const ServiceWorkerUpdater = () => {
    const { handleServiceWorkerUpdate } = useServiceWorkerUpdate()

    useEffect(() => {
        // Register service worker conditionally to improve bfcache compatibility
        if (
            "serviceWorker" in navigator &&
            process.env.NODE_ENV === "production"
        ) {
            serviceWorkerRegistration.register({
                onUpdate: handleServiceWorkerUpdate,
                onSuccess: () => {
                    console.log("Service worker registered successfully")
                },
            })
        }
    }, [handleServiceWorkerUpdate])

    // This component doesn't render anything
    return null
}
