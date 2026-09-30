import { useCallback, useEffect } from "react"
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom"
import Header from "./Header.tsx"
import Footer from "./Footer.tsx"
import ContentPush from "./ContentPush.tsx"
import { ErrorBoundary } from "./ErrorBoundary.tsx"
import Notifications from "../global/Notifications.tsx"
import PageViewTracker from "../global/PageViewTracker.tsx"
import { useUserContext } from "../../contexts/UserContext.tsx"
import { useAppContext } from "../../contexts/AppContext.tsx"
import Modal from "../modal/Modal.tsx"
import AccountForm from "../account/AccountForm.tsx"
import { getConfig } from "../../services/serviceService.ts"
import {
    getConfig as getCachedConfig,
    setConfig as setCachedConfig,
} from "../../utils/localStorage.ts"
import logMessage from "../../utils/logUtils.ts"

function App() {
    const { isAccountModalOpen, closeAccountModal } = useUserContext()
    const { setIsFullScreen, setConfig } = useAppContext()
    const { pathname } = useLocation()

    useEffect(() => {
        setIsFullScreen(false)
    }, [pathname, setIsFullScreen])

    const loadConfig = useCallback(async (signal: AbortSignal) => {
        try {
            const response = await getConfig(signal)
            setConfig(response)
            setCachedConfig(response)
        } catch (error) {
            logMessage("Error getting config from remote", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                },
            })
        }
    }, [])

    useEffect(() => {
        // Race load from cache
        try {
            const cachedConfig = getCachedConfig()
            if (cachedConfig && Object.keys(cachedConfig).length !== 0) {
                setConfig(cachedConfig)
            }
        } catch (error) {
            logMessage("Error loading config from cache", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                },
            })
        }

        let currentController: AbortController | null = null

        const executeFetchCycle = () => {
            if (currentController) currentController.abort()

            currentController = new AbortController()
            loadConfig(currentController.signal)
        }

        executeFetchCycle()
        const intervalId: ReturnType<typeof setInterval> = setInterval(() => {
            executeFetchCycle()
        }, 120000)

        return () => {
            try {
                clearInterval(intervalId)
                if (currentController) {
                    currentController.abort() // Cancel the active network request immediately
                }
            } catch (error) {
                logMessage("Error cleaning up config poll", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
            }
        }
    }, [loadConfig])

    return (
        <ErrorBoundary>
            <Header />
            <PageViewTracker />
            <Outlet />
            {isAccountModalOpen && (
                <Modal onClose={closeAccountModal} fullScreenOnMobile={true}>
                    <AccountForm />
                </Modal>
            )}
            <ScrollRestoration />
            <Footer />
            <Notifications />
            <ContentPush />
        </ErrorBoundary>
    )
}

export default App
