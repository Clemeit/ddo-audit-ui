import Button from "../global/Button"
import Stack from "../global/Stack"
import { useUserContext } from "../../contexts/UserContext"

const LoginButtonContainer = () => {
    const { accessToken, logout, openLoginModal, openRegisterModal } =
        useUserContext()

    return (
        <Stack
            style={{
                marginLeft: "auto",
                alignItems: "center",
                padding: "0px 15px 0px 0px",
            }}
        >
            {!!accessToken ? (
                <Button type="text" small onClick={() => logout()}>
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
