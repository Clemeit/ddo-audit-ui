import React from "react"
import Button from "../global/Button"
import Stack from "../global/Stack"

const IS_LOGGED_IN = false

const LogInButtonContainer = () => {
    return (
        <Stack
            style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: "8px 16px",
                zIndex: 90,
            }}
        >
            {IS_LOGGED_IN ? (
                <Button type="text" small onClick={() => {}}>
                    Log Out
                </Button>
            ) : (
                <>
                    <Button type="text" small onClick={() => {}}>
                        Log In
                    </Button>
                    |
                    <Button type="text" small onClick={() => {}}>
                        Register
                    </Button>
                </>
            )}
        </Stack>
    )
}

export default LogInButtonContainer
