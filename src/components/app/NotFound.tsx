import React from "react"
import Page from "../global/Page.tsx"
import { ContentCluster } from "../global/ContentCluster.tsx"
import Link from "../global/Link.tsx"

const NotFound = () => {
    return (
        <Page title="Not Found" description="This page does not exist.">
            <ContentCluster title="Not Found">
                <p>
                    The page you are looking for does not exist or hasnot been
                    implemented yet. Please check the URL and try again.
                </p>
                <Link to="/">Return to the homepage</Link>
            </ContentCluster>
        </Page>
    )
}

export default NotFound
