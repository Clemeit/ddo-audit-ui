import React from "react"
import "./ErrorBoundary.css"
import logMessage from "../../utils/logUtils.ts"
import Button from "../global/Button.tsx"
import Stack from "../global/Stack.tsx"

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
    errorId?: string
}

interface ErrorBoundaryProps {
    children: React.ReactNode
}

export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Generate a unique error ID for tracking
        const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2)}`
        return {
            hasError: true,
            error,
            errorId,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)

        // Store detailed error info in state for debugging
        this.setState((prevState) => ({
            ...prevState,
            errorInfo,
        }))

        // Log detailed error info
        logMessage("Error caught in ErrorBoundary", "error", {
            metadata: {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
                errorInfo: {
                    componentStack: errorInfo.componentStack,
                },
                errorId: this.state.errorId,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString(),
            },
        })
    }

    handleResetError = () => {
        this.setState({ hasError: false })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container">
                    <h1 style={{ marginBottom: "5px" }}>
                        Well this is awkward.
                    </h1>
                    <p style={{ textAlign: "center" }}>
                        If you're seeing this page, it means that something went
                        wrong. Sorry about that! Please refresh the page or come
                        back later.
                    </p>

                    <Stack gap="10px">
                        <Button onClick={this.handleResetError}>
                            Try Again
                        </Button>
                        <Button onClick={() => (window.location.href = "/")}>
                            Return to the homepage
                        </Button>
                    </Stack>
                </div>
            )
        }

        return this.props.children
    }
}
