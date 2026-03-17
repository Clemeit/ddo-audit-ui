import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { useUserContext } from "../../contexts/UserContext"
import Stack from "../global/Stack"
import Button from "../global/Button"
import ColoredText from "../global/ColoredText"
import { ContentCluster } from "../global/ContentCluster"
import FauxLink from "../global/FauxLink"

const AccountForm = () => {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>(null)

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

    const loginForm = (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                tryLogin()
            }}
            style={{ width: "300px" }}
        >
            <ContentCluster title="Welcome back" hideLink>
                <Stack direction="column" gap={10} width="100%">
                    <Stack direction="column" gap={2} style={{ width: "100%" }}>
                        <label htmlFor="username-field">Username</label>
                        <input
                            id="username-field"
                            type="text"
                            name="username"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box" }}
                            disabled={isLoading}
                        />
                    </Stack>
                    <Stack direction="column" gap={2} style={{ width: "100%" }}>
                        <label htmlFor="password-field">Username</label>
                        <input
                            id="password-field"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box" }}
                            disabled={isLoading}
                        />
                    </Stack>
                    {errorMessage && (
                        <ColoredText color="red">{errorMessage}</ColoredText>
                    )}
                    <Button
                        type="primary"
                        onClick={() => tryLogin()}
                        disabled={isLoading}
                    >
                        Log in
                    </Button>
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            margin: "20px 0px 10px 0px",
                        }}
                    >
                        <hr style={{ margin: "4px 0 4px 0", width: "50%" }} />
                    </div>
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <span>
                            Need to create an account?{" "}
                            <FauxLink
                                onClick={() => {
                                    setErrorMessage("")
                                    openRegisterModal()
                                }}
                            >
                                Register now
                            </FauxLink>
                        </span>
                    </div>
                </Stack>
            </ContentCluster>
        </form>
    )

    const registerForm = (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                tryRegister()
            }}
            style={{ width: "300px" }}
        >
            <ContentCluster title="Create an account" hideLink>
                <Stack direction="column" gap={10} width="100%">
                    <Stack direction="column" gap={2} style={{ width: "100%" }}>
                        <label htmlFor="username-field">Username</label>
                        <input
                            id="username-field"
                            type="text"
                            name="username"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box" }}
                            disabled={isLoading}
                        />
                    </Stack>
                    <Stack direction="column" gap={2} style={{ width: "100%" }}>
                        <label htmlFor="password-field">Username</label>
                        <input
                            id="password-field"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: "100%", boxSizing: "border-box" }}
                            disabled={isLoading}
                        />
                    </Stack>
                    {errorMessage && (
                        <ColoredText color="red">{errorMessage}</ColoredText>
                    )}
                    <Button
                        type="primary"
                        onClick={() => tryRegister()}
                        disabled={isLoading}
                    >
                        Register
                    </Button>
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            margin: "20px 0px 10px 0px",
                        }}
                    >
                        <hr style={{ margin: "4px 0 4px 0", width: "50%" }} />
                    </div>
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <span>
                            Already have an account?{" "}
                            <FauxLink
                                onClick={() => {
                                    setErrorMessage("")
                                    openLoginModal()
                                }}
                            >
                                Log in
                            </FauxLink>
                        </span>
                    </div>
                </Stack>
            </ContentCluster>
        </form>
    )

    return accountModalType === "login" ? loginForm : registerForm
}

export default AccountForm
