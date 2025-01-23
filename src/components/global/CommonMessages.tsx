import React from "react"
import { Link } from "react-router-dom"
import Button from "./Button.tsx"

export const NoVerifiedCharacters = () => (
    <p>
        You registered some characters,{" "}
        <span className="orange-text">
            but you still need to verify them to use this feature
        </span>
        . Head over to the{" "}
        <Link className="link" to="/registration">
            Character Registration
        </Link>{" "}
        page and click the{" "}
        <Button
            type="secondary"
            className="verify-button"
            small
            onClick={() => {}}
            style={{ display: "inline" }}
        >
            Verify
        </Button>{" "}
        button for any character. Once a character has been verified, you'll be
        able to view their activity here.
    </p>
)

export const NoRegisteredCharacters = () => (
    <p>
        You have not registered any characters. Head over to the{" "}
        <Link className="link" to="/registration">
            Character Registration
        </Link>{" "}
        page to get started. Once a character has been registered, you'll be
        able to view their activity here.
    </p>
)

export const NoRegisteredAndVerifiedCharacters = () => (
    <p>
        You have not registered and verified any characters. Head over to the{" "}
        <Link className="link" to="/registration">
            Character Registration
        </Link>{" "}
        page to get started. Once a character has been registered{" "}
        <strong>and</strong> verified, you'll be able to view their activity
        here.
    </p>
)

export const ErrorGettingRegisteredCharacters = () => (
    <p>
        There was an error getting your registered characters. Please try
        refreshing the page.
    </p>
)
