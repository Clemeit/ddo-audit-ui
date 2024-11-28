import React, { lazy } from "react"
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom"

// Import common pages
import App from "./components/app/App.tsx"
import Directory from "./components/directory/Directory.tsx"

// Lazy load uncommon pages
// const LazyPage1 = lazy(() => import("./LazyPage1"))

// Set up the router
export default createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route index element={<Directory />} />
            {/* <Route path="/fakepage1" element={<FakePage1 />} /> */}
        </Route>
    )
)
