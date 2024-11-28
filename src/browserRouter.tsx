import React, { lazy } from "react"
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom"

// Import common pages
import App from "./components/app/App.tsx"
import Directory from "./components/directory/Directory.tsx"
import FakePage1 from "./FakePage1"
import FakePage2 from "./FakePage2"
import FakePage3 from "./FakePage3"

// Lazy load uncommon pages
const LazyPage1 = lazy(() => import("./LazyPage1"))

// Set up the router
export default createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route index element={<Directory />} />
            <Route path="/fakepage1" element={<FakePage1 />} />
            <Route path="/fakepage2" element={<FakePage2 />} />
            <Route path="/fakepage3" element={<FakePage3 />} />
            <Route path="/lazypage1" element={<LazyPage1 />} />
        </Route>
    )
)
