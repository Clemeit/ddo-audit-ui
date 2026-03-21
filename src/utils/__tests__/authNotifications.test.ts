import { notifyAuthError } from "../authNotifications"
import type { AuthErrorAction } from "../authNotifications"

describe("authNotifications", () => {
    it("calls createNotification with correct error for login", () => {
        const createNotification = jest.fn()
        notifyAuthError(createNotification, "login")
        expect(createNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Login Failed",
                type: "error",
                ttl: 10000,
            })
        )
    })

    it("uses custom message when provided", () => {
        const createNotification = jest.fn()
        notifyAuthError(createNotification, "login", "Custom error message")
        expect(createNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Custom error message",
            })
        )
    })

    it("uses default message when no custom message", () => {
        const createNotification = jest.fn()
        notifyAuthError(createNotification, "login")
        expect(createNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Invalid username or password.",
            })
        )
    })

    it.each<AuthErrorAction>([
        "login",
        "register",
        "change-password",
        "logout",
        "delete-account",
        "delete-settings",
    ])("handles '%s' action without throwing", (action) => {
        const createNotification = jest.fn()
        expect(() => notifyAuthError(createNotification, action)).not.toThrow()
        expect(createNotification).toHaveBeenCalledTimes(1)
    })
})
