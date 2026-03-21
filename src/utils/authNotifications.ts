import { Notification } from "../models/Client"

type CreateNotification = (notification: Notification) => void

type AuthErrorAction =
    | "login"
    | "register"
    | "change-password"
    | "logout"
    | "delete-account"
    | "delete-settings"

const AUTH_ERROR_TTL = 10000

const AUTH_ERROR_COPY: Record<
    AuthErrorAction,
    { title: string; defaultMessage: string }
> = {
    login: {
        title: "Login Failed",
        defaultMessage: "Invalid username or password.",
    },
    register: {
        title: "Registration Failed",
        defaultMessage: "Unable to register. Please try again.",
    },
    "change-password": {
        title: "Password Update Failed",
        defaultMessage: "Unable to update password. Please try again.",
    },
    logout: {
        title: "Logout Failed",
        defaultMessage:
            "An error occurred while trying to log out. Please try again.",
    },
    "delete-account": {
        title: "Account Deletion Failed",
        defaultMessage:
            "An error occurred while trying to delete your account. Please try again later.",
    },
    "delete-settings": {
        title: "Setting Deletion Failed",
        defaultMessage:
            "An error occurred while trying to delete your settings. Please try again later.",
    },
}

function notifyAuthError(
    createNotification: CreateNotification,
    action: AuthErrorAction,
    message?: string
) {
    const copy = AUTH_ERROR_COPY[action]

    createNotification({
        title: copy.title,
        message: message ?? copy.defaultMessage,
        type: "error",
        ttl: AUTH_ERROR_TTL,
    })
}

export { notifyAuthError }
export type { AuthErrorAction, CreateNotification }
