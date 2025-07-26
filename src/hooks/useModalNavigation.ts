import { useLocation, useNavigate } from "react-router-dom"

interface UseModalNavigationOptions {
    modalKey?: string
}

/**
 * Custom hook for managing modal state through browser navigation.
 * This allows modals to be closed with the browser's back button and
 * provides a clean way to manage modal state in the URL.
 */
export const useModalNavigation = (options: UseModalNavigationOptions = {}) => {
    const { modalKey = "modal" } = options
    const navigate = useNavigate()
    const location = useLocation()

    // Modal state is derived from location state
    const isModalOpen = location.state?.[modalKey] === true

    const openModal = async () => {
        await navigate(location.pathname + location.search, {
            state: { ...location.state, [modalKey]: true },
            replace: false,
        })
    }

    const closeModal = async () => {
        // Navigate back to close the modal
        await navigate(-1)
    }

    return {
        isModalOpen,
        openModal,
        closeModal,
    }
}
