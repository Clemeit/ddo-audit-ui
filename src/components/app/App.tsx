import { useEffect } from "react"
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

function App() {
    const { isAccountModalOpen, closeAccountModal } = useUserContext()
    const { setIsFullScreen } = useAppContext()
    const { pathname } = useLocation()

    useEffect(() => {
        setIsFullScreen(false)
    }, [pathname])

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
