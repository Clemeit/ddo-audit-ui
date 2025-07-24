import React from "react"
import logMessage from "../../utils/logUtils.ts"

interface ComponentErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
    errorId?: string
}

interface ComponentErrorBoundaryProps {
    children: React.ReactNode
    componentName?: string
    fallback?: React.ComponentType<{
        error?: Error
        errorId?: string
        onRetry?: () => void
    }>
}

const DefaultFallback: React.FC<{
    error?: Error
    errorId?: string
    onRetry?: () => void
}> = ({ error, errorId, onRetry }) => (
    <div
        style={{
            padding: "20px",
            margin: "20px",
            border: "2px solid #ff6b6b",
            borderRadius: "8px",
            backgroundColor: "#fff5f5",
            textAlign: "center",
        }}
    >
        <h3 style={{ color: "#d63031", marginBottom: "10px" }}>
            Component Error
        </h3>
        <p style={{ marginBottom: "15px" }}>
            This component encountered an error and couldn't render properly.
        </p>
        {process.env.NODE_ENV === "development" && error && (
            <details
                style={{
                    marginBottom: "15px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontFamily: "monospace",
                }}
            >
                <summary style={{ cursor: "pointer" }}>Error Details</summary>
                <p>
                    <strong>Error ID:</strong> {errorId}
                </p>
                <p>
                    <strong>Message:</strong> {error.message}
                </p>
                {error.stack && (
                    <pre
                        style={{
                            fontSize: "10px",
                            maxHeight: "150px",
                            overflow: "auto",
                            backgroundColor: "#f8f8f8",
                            padding: "8px",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {error.stack}
                    </pre>
                )}
            </details>
        )}
        {onRetry && (
            <button
                onClick={onRetry}
                style={{
                    padding: "8px 16px",
                    backgroundColor: "#00b894",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                Try Again
            </button>
        )}
    </div>
)

export class ComponentErrorBoundary extends React.Component<
    ComponentErrorBoundaryProps,
    ComponentErrorBoundaryState
> {
    constructor(props: ComponentErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ComponentErrorBoundaryState {
        const errorId = `comp_err_${Date.now()}_${Math.random().toString(36).substring(2)}`
        return {
            hasError: true,
            error,
            errorId,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(
            `ComponentErrorBoundary [${this.props.componentName || "Unknown"}] caught an error:`,
            error,
            errorInfo
        )

        this.setState((prevState) => ({
            ...prevState,
            errorInfo,
        }))

        // Log with component context
        logMessage(
            `Component error in ${this.props.componentName || "Unknown Component"}`,
            "error",
            {
                metadata: {
                    componentName: this.props.componentName,
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
                    // Add React version and other useful context
                    reactVersion: React.version,
                },
            }
        )
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
        })
    }

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultFallback
            return (
                <FallbackComponent
                    error={this.state.error}
                    errorId={this.state.errorId}
                    onRetry={this.handleRetry}
                />
            )
        }

        return this.props.children
    }
}

export default ComponentErrorBoundary
