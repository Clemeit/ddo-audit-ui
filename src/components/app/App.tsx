import { Outlet, ScrollRestoration } from "react-router-dom"
import React from "react"
import Header from "./Header.tsx"
import Footer from "./Footer.tsx"
import ContentPush from "./ContentPush.tsx"
import { ErrorBoundary } from "./ErrorBoundary.tsx"
import Notifications from "../global/Notifications.tsx"

// Check if localStorage is set. If not, show enter token form
// If so, show the app

// const value = localStorage.getItem("access-token")

// const enterTokenForm = () => {
//     return (
//         <form>
//             <input id="token-input" type="text" placeholder="Enter token" />
//             <button
//                 type="submit"
//                 onClick={() => {
//                     localStorage.setItem(
//                         "access-token",
//                         (
//                             document.getElementById(
//                                 "token-input"
//                             ) as HTMLInputElement
//                         ).value
//                     )
//                     window.location.reload()
//                 }}
//             >
//                 Enter
//             </button>
//         </form>
//     )
// }

function App() {
    return (
        <ErrorBoundary>
            {/* {value === "clemeit" ? ( */}
            <>
                <Header />
                <Outlet />
                <ScrollRestoration />
                <Footer />
                <Notifications />
                <ContentPush />
            </>
            {/* ) : (
                enterTokenForm()
            )} */}
        </ErrorBoundary>
    )
}

export default App
