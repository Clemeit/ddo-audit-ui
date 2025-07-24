import React from "react"
import ColoredText from "../global/ColoredText.tsx"
import { ContentCluster } from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import Button from "../global/Button.tsx"

interface GroupingErrorFallbackProps {
    error?: Error
    errorId?: string
    onRetry?: () => void
}

const GroupingErrorFallback: React.FC<GroupingErrorFallbackProps> = ({
    error,
    errorId,
    onRetry,
}) => {
    const getErrorMessage = () => {
        if (!error) return "An unknown error occurred"

        // Check for common error patterns
        if (error.message.includes("useQuestContext must be used within")) {
            return "Quest data is not available. This usually means the app is still loading or there's a configuration issue."
        }

        if (error.message.includes("Cannot read properties of undefined")) {
            return "Some data wasn't loaded properly. This might be a temporary network issue."
        }

        if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("Network Error")
        ) {
            return "Unable to connect to the server. Please check your internet connection."
        }

        return `An unexpected error occurred: ${error.message}`
    }

    const getHelpfulTips = () => {
        if (!error) return []

        const tips = []

        if (error.message.includes("useQuestContext")) {
            tips.push("Try refreshing the page to reload quest data")
        }

        if (
            error.message.includes("Cannot read properties") ||
            error.message.includes("undefined")
        ) {
            tips.push(
                "Wait a moment and try again - data might still be loading"
            )
            tips.push("Check your internet connection")
        }

        if (
            error.message.includes("fetch") ||
            error.message.includes("Network")
        ) {
            tips.push("Check your internet connection")
            tips.push("Try refreshing the page")
            tips.push("The DDO Audit server might be experiencing issues")
        }

        return tips
    }

    return (
        <Page title="DDO Audit" description="Grouping Error">
            <ContentCluster title="Oops! Something went wrong">
                <div style={{ padding: "20px", textAlign: "center" }}>
                    <div style={{ marginBottom: "15px" }}>
                        <ColoredText color="secondary">
                            {getErrorMessage()}
                        </ColoredText>
                    </div>

                    {process.env.NODE_ENV === "development" && errorId && (
                        <div
                            style={{
                                marginBottom: "15px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                color: "#666",
                            }}
                        >
                            Error ID: {errorId}
                        </div>
                    )}

                    {getHelpfulTips().length > 0 && (
                        <div
                            style={{ marginBottom: "20px", textAlign: "left" }}
                        >
                            <strong>Try these solutions:</strong>
                            <ul style={{ marginTop: "10px" }}>
                                {getHelpfulTips().map((tip, index) => (
                                    <li
                                        key={index}
                                        style={{ marginBottom: "5px" }}
                                    >
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        {onRetry && (
                            <Button type="secondary" onClick={onRetry}>
                                Try Again
                            </Button>
                        )}
                        <Button
                            type="secondary"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => (window.location.href = "/")}
                        >
                            Return to the homepage
                        </Button>
                    </div>
                </div>
            </ContentCluster>
        </Page>
    )
}

export default GroupingErrorFallback
