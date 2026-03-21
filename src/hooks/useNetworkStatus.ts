import { useState, useEffect } from "react"

const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        // Re-sync in case the status changed between the initial render and
        // when the listeners were attached (closes the race window on page load)
        setIsOnline(navigator.onLine)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    return isOnline
}

export default useNetworkStatus
