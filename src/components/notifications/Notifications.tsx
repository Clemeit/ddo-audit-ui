import React from "react"
import "./Notifications.css"
import Page from "../global/Page.tsx"
import usePagination from "../../hooks/usePagination.ts"
import Page1 from "./Page1.tsx"
import Page2 from "./Page2.tsx"

const Notifications = () => {
    const { currentPage, setPage } = usePagination({
        useQueryParams: true,
        clearOtherQueryParams: false,
        maxPage: 2,
    })

    function requestPermission() {
        console.log("Requesting permission...")
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                console.log("Notification permission granted.")
            }
        })
    }
    requestPermission()

    return (
        <Page
            title="LFM Notifications"
            description="Set up LFM notifications and never miss your favorite quest or raid again!"
        >
            {currentPage === 1 && <Page1 setPage={setPage} />}
            {currentPage === 2 && <Page2 setPage={setPage} />}
        </Page>
    )
}

export default Notifications
