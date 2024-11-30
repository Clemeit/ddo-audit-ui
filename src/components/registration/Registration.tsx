import React from "react"
import Page from "../global/Page.tsx"
import usePagination from "../../hooks/usePagination.ts"
import "./Registration.css"
import Page1 from "./Page1.tsx"
import Page2 from "./Page2.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import NavigationCard from "../global/NavigationCard.tsx"

const Registration = () => {
    const { currentPage, setPage } = usePagination()

    return (
        <Page className="registration" title="DDO Character Registration">
            {currentPage === 1 && <Page1 setPage={setPage} />}
            {currentPage === 2 && <Page2 setPage={setPage} />}
            <ContentCluster title="See Also">
                <div className="nav-card-cluster">
                    <NavigationCard type="verification" />
                    <NavigationCard type="timers" />
                </div>
            </ContentCluster>
        </Page>
    )
}

export default Registration
