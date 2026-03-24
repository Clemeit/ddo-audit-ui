import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { useUserContext } from "../../contexts/UserContext"
import Stack from "../global/Stack"
import Button from "../global/Button"
import ColoredText from "../global/ColoredText"
import { ContentCluster } from "../global/ContentCluster"
import FauxLink from "../global/FauxLink"
import { ReactComponent as LogoSVG } from "../../assets/svg/logo.svg"
import useWindowSize from "../../hooks/useWindowSize"
import { useNotificationContext } from "../../contexts/NotificationContext"
import { notifyAuthError } from "../../utils/authNotifications"
import logMessage from "../../utils/logUtils"

const AccountForm = () => {
    const isAlphanumericUsername = (value: string) =>
        /^[a-zA-Z0-9]+$/.test(value)

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [oldPassword, setOldPassword] = useState<string>("")
    const [newPassword, setNewPassword] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>(null)
    const [successMessage, setSuccessMessage] = useState<string>("")
    const [didChangePassword, setDidChangePassword] = useState(false)
    const { isMobile, isSmallishMobile } = useWindowSize()

    useEffect(() => {
        setErrorMessage("")
        setSuccessMessage("")
    }, [username, password, oldPassword, newPassword, confirmPassword])

    const {
        register,
        login,
        changePassword,
        openRegisterModal,
        openLoginModal,
        accountModalType,
        isAccountModalOpen,
        isLoading,
    } = useUserContext()
    const { createNotification } = useNotificationContext()

    useEffect(() => {
        setUsername("")
        setPassword("")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setErrorMessage("")
        setSuccessMessage("")
        setDidChangePassword(false)
    }, [isAccountModalOpen])

    useEffect(() => {
        setPassword("")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
    }, [accountModalType])

    const tryLogin = useCallback(async () => {
        if (!username || !password) {
            setErrorMessage("Please enter a username and password.")
            return
        }

        if (!isAlphanumericUsername(username)) {
            setErrorMessage("Username must contain letters and numbers only.")
            return
        }

        try {
            await login({
                username,
                password,
            })
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                setErrorMessage("Too many attempts. Please try again later.")
                logMessage("User login rate limited", "warn", {
                    metadata: {
                        status: 429,
                    },
                })
            } else {
                logMessage("User login failed", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                setErrorMessage("Invalid username or password.")
            }
        }
    }, [username, password, login])

    const tryRegister = useCallback(async () => {
        if (!username || !password) {
            setErrorMessage("Please enter a username and password.")
            return
        }

        if (username.length < 5) {
            setErrorMessage("Username must contain 5 characters.")
            return
        }

        if (!isAlphanumericUsername(username)) {
            setErrorMessage("Username must contain letters and numbers only.")
            return
        }

        if (password.length < 5) {
            setErrorMessage("Password must contain 5 characters.")
            return
        }

        if (username.includes(" ") || password.includes(" ")) {
            setErrorMessage("Username and password cannot contain spaces.")
            return
        }

        if (username === password) {
            setErrorMessage("Username and password cannot be the same.")
            return
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.")
            return
        }

        try {
            await register({
                username,
                password,
            })
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                setErrorMessage("Too many attempts. Please try again later.")
                logMessage("User registration rate limited", "warn", {
                    metadata: {
                        status: 429,
                    },
                })
            } else {
                logMessage("User registration failed", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                setErrorMessage("Unable to register. Please try again.")
            }
        }
    }, [username, password, confirmPassword, register])

    const tryChangePassword = useCallback(async () => {
        if (!oldPassword || !newPassword) {
            setErrorMessage("Please enter your current and new password.")
            return
        }

        if (newPassword.length < 5) {
            setErrorMessage("New password must contain 5 characters.")
            return
        }

        if (oldPassword === newPassword) {
            setErrorMessage(
                "New password must be different from your current password."
            )
            return
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("New passwords do not match.")
            return
        }

        try {
            await changePassword({
                old_password: oldPassword,
                new_password: newPassword,
            })
            setOldPassword("")
            setNewPassword("")
            setSuccessMessage("Password updated successfully.")
            setDidChangePassword(true)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                setErrorMessage("Too many attempts. Please try again later.")
                logMessage("Password change rate limited", "warn", {
                    metadata: {
                        status: 429,
                    },
                })
                notifyAuthError(
                    createNotification,
                    "change-password",
                    "Too many attempts. Please try again later."
                )
            } else if (
                axios.isAxiosError(error) &&
                error.response?.status === 400
            ) {
                setErrorMessage("Current password is incorrect.")
                logMessage(
                    "Password change failed: incorrect current password",
                    "warn",
                    {
                        metadata: {
                            status: 400,
                        },
                    }
                )
                notifyAuthError(
                    createNotification,
                    "change-password",
                    "Current password is incorrect."
                )
            } else {
                logMessage("Password change failed", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                setErrorMessage("Unable to update password. Please try again.")
                notifyAuthError(
                    createNotification,
                    "change-password",
                    "Unable to update password. Please try again."
                )
            }
        }
    }, [
        changePassword,
        oldPassword,
        newPassword,
        confirmPassword,
        createNotification,
    ])

    const isSubmitDisabled = isLoading

    const passwordWasUpdatedScreen = <div>Your password has been updated!</div>

    return didChangePassword ? (
        passwordWasUpdatedScreen
    ) : (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                if (accountModalType === "login") {
                    tryLogin()
                } else if (accountModalType === "change-password") {
                    tryChangePassword()
                } else {
                    tryRegister()
                }
            }}
            style={{ maxWidth: isMobile ? "unset" : "650px" }}
        >
            <ContentCluster
                title={
                    accountModalType === "login"
                        ? "Welcome back!"
                        : accountModalType === "change-password"
                          ? "Change password"
                          : "Create an account"
                }
                hideLink
            >
                <Stack
                    direction={isSmallishMobile ? "column" : "row"}
                    style={{ width: "100%" }}
                    gap={20}
                    wrap
                >
                    <Stack
                        direction="column"
                        gap={10}
                        style={{
                            flex: 1,
                            minWidth: isSmallishMobile ? 0 : "200px",
                            width: "100%",
                        }}
                    >
                        <LogoSVG style={{ width: "40px", height: "40px" }} />
                        {accountModalType === "login" ? (
                            <span>
                                Log in with your DDO Audit account. This is NOT
                                the same as your DDO account.
                            </span>
                        ) : accountModalType === "change-password" ? (
                            <span>
                                Update your DDO Audit account password. This is
                                NOT the same as your DDO account password.
                            </span>
                        ) : (
                            <>
                                <span>
                                    A DDO Audit account lets you save your
                                    settings and characters to be used across
                                    devices.
                                </span>
                                <span>
                                    You shouldn't use the same login credentials
                                    that you use for DDO.
                                </span>
                            </>
                        )}
                    </Stack>
                    <Stack
                        direction="column"
                        gap={10}
                        style={{
                            flex: 1,
                            minWidth: isSmallishMobile ? 0 : "200px",
                            width: "100%",
                        }}
                    >
                        {accountModalType !== "change-password" && (
                            <Stack
                                direction="column"
                                gap={2}
                                style={{ width: "100%" }}
                            >
                                <label htmlFor="username-field">Username</label>
                                <input
                                    id="username-field"
                                    type="text"
                                    name="username"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                    }}
                                    disabled={isSubmitDisabled}
                                />
                            </Stack>
                        )}
                        <Stack
                            direction="column"
                            gap={2}
                            style={{ width: "100%" }}
                        >
                            <label htmlFor="password-field">
                                {accountModalType === "change-password"
                                    ? "Current Password"
                                    : "Password"}
                            </label>
                            <input
                                id="password-field"
                                type="password"
                                name="password"
                                autoComplete={
                                    accountModalType === "login"
                                        ? "current-password"
                                        : "new-password"
                                }
                                value={
                                    accountModalType === "change-password"
                                        ? oldPassword
                                        : password
                                }
                                onChange={(e) => {
                                    if (
                                        accountModalType === "change-password"
                                    ) {
                                        setOldPassword(e.target.value)
                                    } else {
                                        setPassword(e.target.value)
                                    }
                                }}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                                disabled={isSubmitDisabled}
                            />
                            {(accountModalType === "register" ||
                                accountModalType === "change-password") && (
                                <label htmlFor="confirm-password-field">
                                    Confirm Password
                                </label>
                            )}
                            {(accountModalType === "register" ||
                                accountModalType === "change-password") && (
                                <input
                                    id="confirm-password-field"
                                    type="password"
                                    name="confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                    }}
                                    disabled={isSubmitDisabled}
                                />
                            )}
                        </Stack>
                        {accountModalType === "change-password" && (
                            <Stack
                                direction="column"
                                gap={2}
                                style={{ width: "100%" }}
                            >
                                <label htmlFor="new-password-field">
                                    New Password
                                </label>
                                <input
                                    id="new-password-field"
                                    type="password"
                                    name="new-password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                    }}
                                    disabled={isSubmitDisabled}
                                />
                            </Stack>
                        )}
                        {errorMessage && (
                            <ColoredText color="red">
                                {errorMessage}
                            </ColoredText>
                        )}
                        {successMessage && (
                            <ColoredText color="green">
                                {successMessage}
                            </ColoredText>
                        )}
                        {accountModalType === "login" ? (
                            <Button
                                type="primary"
                                onClick={() => tryLogin()}
                                disabled={isSubmitDisabled}
                            >
                                Log in
                            </Button>
                        ) : accountModalType === "change-password" ? (
                            <Button
                                type="primary"
                                onClick={() => tryChangePassword()}
                                disabled={isSubmitDisabled}
                            >
                                Update password
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                onClick={() => tryRegister()}
                                disabled={isSubmitDisabled}
                            >
                                Register
                            </Button>
                        )}
                        {accountModalType !== "change-password" && (
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    margin: "20px 0px 10px 0px",
                                }}
                            >
                                <hr
                                    style={{
                                        margin: "4px 0 4px 0",
                                        width: "50%",
                                    }}
                                />
                            </div>
                        )}
                        {accountModalType !== "change-password" && (
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                {accountModalType === "login" ? (
                                    <span style={{ textAlign: "center" }}>
                                        Need an account?{" "}
                                        <FauxLink
                                            onClick={() => {
                                                setErrorMessage("")
                                                openRegisterModal()
                                            }}
                                        >
                                            Register&nbsp;now
                                        </FauxLink>
                                    </span>
                                ) : (
                                    <span style={{ textAlign: "center" }}>
                                        Already have an account?{" "}
                                        <FauxLink
                                            onClick={() => {
                                                setErrorMessage("")
                                                openLoginModal()
                                            }}
                                        >
                                            Log&nbsp;in
                                        </FauxLink>
                                    </span>
                                )}
                            </div>
                        )}
                    </Stack>
                </Stack>
            </ContentCluster>
        </form>
    )
}

export default AccountForm
