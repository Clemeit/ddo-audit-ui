import React from "react"
import Page from "../global/Page.tsx"
import usePagination from "../../hooks/usePagination.ts"
import "./Registration.css"
import Page1 from "./Page1.tsx"
import Page2 from "./Page2.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import NavigationCard from "../global/NavigationCard.tsx"

const Registration = () => {
    const { currentPage, setPage } = usePagination({
        useQueryParams: true,
        clearOtherQueryParams: false,
        maxPage: 2,
    })

    return (
        <Page
            title="DDO Character Registration"
            description="Register your characters to automatically filter LFMs and see your raid timers."
            className="registration"
        >
            {currentPage === 1 && <Page1 setPage={setPage} />}
            {currentPage === 2 && <Page2 setPage={setPage} />}
            {currentPage === 1 && (
                <ContentCluster title="See Also...">
                    <div className="nav-card-cluster">
                        <NavigationCard type="timers" />
                        <NavigationCard type="activity" />
                    </div>
                </ContentCluster>
            )}
        </Page>
    )
}

export default Registration
