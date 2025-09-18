import React from "react"
import Page from "../../global/Page"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../../global/ContentCluster"

const Donated = () => {
    return (
        <Page
            title="Thank you for supporting DDO Audit!"
            description="Thank you for supporting DDO Audit!"
        >
            <ContentClusterGroup>
                <ContentCluster title="Thank you!">
                    <p>
                        I fell in love with DDO back in 2009, and I have been
                        looking for ways to give back to the community ever
                        since. That desire eventually came to fruition in the
                        form of DDO Audit. I never imagined that it would grow
                        to be as popular as it is today, and I am so thankful
                        for all of the support I have received over the years.
                    </p>
                    <p>
                        Your generous donation will ensure that DDO Audit can
                        continue to be loved by thousands of other DDO players
                        for free. I am very grateful for your support!
                    </p>
                    <p>
                        <i>Clemeit of Thrane</i>
                    </p>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Donated
