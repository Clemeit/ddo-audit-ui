import React from "react"
import Link from "./Link.tsx"
import Button from "./Button.tsx"
import PageMessage from "./PageMessage.tsx"
import Stack from "./Stack.tsx"
import { ReactComponent as X } from "../../assets/svg/x.svg"

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

export const LiveDataHaultedPageMessage = () => (
    <PageMessage
        title="Live update paused"
        message="Are you still there? Please refresh the page to continue viewing live data."
        type="warning"
    />
)

export const StaleDataPageMessage = () => (
    <PageMessage
        type="warning"
        title="Stale data"
        message={
            <>
                <span>
                    The data on this page is stale. Please refresh the page to
                    get the latest data.
                </span>
            </>
        }
    />
)

export const DataLoadingErrorPageMessage = () => (
    <PageMessage
        type="error"
        title="Failed to load data"
        message={
            <>
                <span>
                    There was an error loading some data. Please refresh the
                    page or come back later.
                </span>
            </>
        }
    />
)

export const WIPPageMessage = () => (
    <PageMessage
        title="Work in progress"
        message="This page is still being actively developed. Everything here is subject to change or removal."
    />
)

export const AlphaReleasePageMessage = ({ onDismiss = null }) => (
    <PageMessage
        title="DDO Audit 64-bit Alpha Release"
        message={
            <span>
                This is an alpha release of DDO Audit. The decision to release
                early was made to accommodate the recent addition of the 64-bit
                servers.
                <br />
                <br />
                Many features are still in development. Some features may not be
                available yet, and some may not work as expected. Please report
                any issues you encounter.
            </span>
        }
        onDismiss={onDismiss}
    />
)

export const ServerOfflineMessage = ({
    handleDismiss,
    handleReportBug,
}: {
    handleDismiss: () => void
    handleReportBug: () => void
}) => {
    const [isReported, setIsReported] = React.useState(false)

    const onReportBug = () => {
        setIsReported(true)
        handleReportBug()
    }

    return (
        <div style={{ padding: "0px 10px" }}>
            <h3
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                }}
            >
                <X className="status-icon" title="Offline" />
                <span>Server Offline</span>
            </h3>
            <p>
                Check the{" "}
                <Link className="link" to="/live">
                    Live page
                </Link>{" "}
                for live server status. If you think this is an error,
            </p>
            <Stack gap="10px" className="full-column-on-mobile">
                <Button onClick={handleDismiss} fullWidthOnMobile>
                    Load data anyway
                </Button>
                <Button
                    type="secondary"
                    onClick={onReportBug}
                    fullWidthOnMobile
                    disabled={isReported}
                >
                    {isReported ? "Thanks!" : "Report bug"}
                </Button>
            </Stack>
        </div>
    )
}
