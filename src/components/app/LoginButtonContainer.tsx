import Button from "../global/Button"
import Stack from "../global/Stack"
import { useUserContext } from "../../contexts/UserContext"
import { useCallback } from "react"
import { useNotificationContext } from "../../contexts/NotificationContext"
import { notifyAuthError } from "../../utils/authNotifications"

const LoginButtonContainer = () => {
    const { accessToken, logout, openLoginModal, openRegisterModal } =
        useUserContext()
    const { createNotification } = useNotificationContext()

    const handleLogout = useCallback(async () => {
        try {
            await logout()
        } catch {
            notifyAuthError(createNotification, "logout")
        }
    }, [logout, createNotification])

    return (
        <Stack
            style={{
                marginLeft: "auto",
                alignItems: "center",
                padding: "0px 15px 0px 0px",
            }}
        >
            {!!accessToken ? (
                <Button type="text" small onClick={() => void handleLogout()}>
                    Log Out
                </Button>
            ) : (
                <>
                    <Button type="text" small onClick={() => openLoginModal()}>
                        Log&nbsp;In
                    </Button>
                    |
                    <Button
                        type="text"
                        small
                        onClick={() => openRegisterModal()}
                    >
                        Register
                    </Button>
                </>
            )}
        </Stack>
    )
}

export default LoginButtonContainer
