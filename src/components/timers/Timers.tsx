import React from "react"
import Page from "../global/Page.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import {
    ErrorGettingRegisteredCharacters,
    NoRegisteredAndVerifiedCharacters,
    NoVerifiedCharacters,
} from "../global/CommonMessages.tsx"
import { Link } from "react-router-dom"
import useGetCharacterTimers from "../../hooks/useGetCharacterTimers.ts"
import { pluralize } from "../../utils/stringUtils.ts"
import NavigationCard from "../global/NavigationCard.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"

const Timers = () => {
    const { registeredCharacters, verifiedCharacters, isLoaded, isError } =
        useGetRegisteredCharacters()
    const { characterTimers } = useGetCharacterTimers({ verifiedCharacters })

    const getContentHeader = () => {
        if (isError) {
            return <ErrorGettingRegisteredCharacters />
        }

        if (!isLoaded) {
            return <p>Loading...</p>
        }

        if (registeredCharacters.length === 0) {
            return <NoRegisteredAndVerifiedCharacters />
        }

        if (verifiedCharacters.length === 0) {
            return <NoVerifiedCharacters />
        }

        if (registeredCharacters.length > 0) {
            return (
                <p>
                    Showing timers for{" "}
                    <span className="orange-text">
                        {verifiedCharacters.length} verified{" "}
                        {pluralize("character", verifiedCharacters.length)}
                    </span>
                    .{" "}
                    <Link to="/registration" className="link">
                        Add more
                    </Link>
                    .
                </p>
            )
        }
    }

    const conditionalTimerContent = () => {
        if (verifiedCharacters.length === 0)
            return (
                <div
                    style={{
                        width: "100%",
                        height: "10vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <span>Waiting for some verified characters...</span>
                </div>
            )
    }

    return (
        <Page
            title="Raid and Quest Timers"
            description="View your raid and quest timers. See which raids you're on timer for and which quests you've ransacked."
        >
            <ContentCluster title="Timers">
                {getContentHeader()}
                {conditionalTimerContent()}
            </ContentCluster>
            <ContentCluster title="See Also...">
                <NavCardCluster>
                    <NavigationCard type="registration" />
                </NavCardCluster>
            </ContentCluster>
        </Page>
    )
}

export default Timers
