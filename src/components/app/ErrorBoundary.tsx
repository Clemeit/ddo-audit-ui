import React from "react"
import "./ErrorBoundary.css"
import { Link } from "react-router-dom"

interface ErrorBoundaryState {
    hasError: boolean
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

    static getDerivedStateFromError(error: Error) {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container">
                    <h1>Something went wrong.</h1>
                    <p>
                        If you're seeing this page, it means that something went
                        wrong. Please try refreshing the page or come back
                        later.
                    </p>
                    <Link to="/">Return to the homepage</Link>
                </div>
            )
        }

        return this.props.children
    }
}