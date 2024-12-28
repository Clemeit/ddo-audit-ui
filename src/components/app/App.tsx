import { Outlet, ScrollRestoration } from "react-router-dom"
import React from "react"
import Header from "./Header.tsx"
import Footer from "./Footer.tsx"
import ContentPush from "./ContentPush.tsx"
import { ErrorBoundary } from "./ErrorBoundary.tsx"

function App() {
    return (
        <ErrorBoundary>
            <Header />
            <Outlet />
            <ScrollRestoration />
            <Footer />
            <ContentPush />
        </ErrorBoundary>
    )
}

export default App
