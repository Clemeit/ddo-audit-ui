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

const AccountForm = () => {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>(null)
    const { isMobile, isSmallishMobile } = useWindowSize()

    useEffect(() => {
        setErrorMessage("")
    }, [username, password])

    const {
        register,
        login,
        openRegisterModal,
        openLoginModal,
        accountModalType,
        isLoginModalOpen,
        isLoading,
    } = useUserContext()

    useEffect(() => {
        setUsername("")
        setPassword("")
        setErrorMessage("")
    }, [isLoginModalOpen])

    const tryLogin = useCallback(async () => {
        if (!username || !password) {
            setErrorMessage("Please enter a username and password.")
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
            } else {
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

        if (password.length < 5) {
            setErrorMessage("Password must contain 5 characters.")
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
            } else {
                setErrorMessage("Unable to register. Please try again.")
            }
        }
    }, [username, password, register])

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                if (accountModalType === "login") {
                    tryLogin()
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
                        ) : (
                            <>
                                <span>
                                    A DDO Audit account lets you save your
                                    settings and characters to be used across
                                    devices.
                                </span>
                                <span>
                                    Do NOT use the same login credentials that
                                    you use for DDO.
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
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                                disabled={isLoading}
                            />
                        </Stack>
                        <Stack
                            direction="column"
                            gap={2}
                            style={{ width: "100%" }}
                        >
                            <label htmlFor="password-field">Password</label>
                            <input
                                id="password-field"
                                type="password"
                                name="password"
                                autoComplete={
                                    accountModalType === "login"
                                        ? "current-password"
                                        : "new-password"
                                }
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                                disabled={isLoading}
                            />
                        </Stack>
                        {errorMessage && (
                            <ColoredText color="red">
                                {errorMessage}
                            </ColoredText>
                        )}
                        {accountModalType === "login" ? (
                            <Button
                                type="primary"
                                onClick={() => tryLogin()}
                                disabled={isLoading}
                            >
                                Log in
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                onClick={() => tryRegister()}
                                disabled={isLoading}
                            >
                                Register
                            </Button>
                        )}
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                margin: "20px 0px 10px 0px",
                            }}
                        >
                            <hr
                                style={{ margin: "4px 0 4px 0", width: "50%" }}
                            />
                        </div>
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
                    </Stack>
                </Stack>
            </ContentCluster>
        </form>
    )
}

export default AccountForm
