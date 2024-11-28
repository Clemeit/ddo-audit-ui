import { Outlet, ScrollRestoration } from "react-router-dom"
import React from "react"
import Header from "./Header.tsx"
import Footer from "./Footer.tsx"
import ContentPush from "./ContentPush.tsx"

function App() {
    return (
        <div>
            <Header />
            <Outlet />
            <ScrollRestoration />
            <Footer />
            <ContentPush />
        </div>
    )
}

export default App
