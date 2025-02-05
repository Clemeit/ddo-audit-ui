import React from "react"
import Page from "../global/Page.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import useGetLiveData from "../../hooks/useGetLiveData.ts"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { LoadingState } from "../../models/Api.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"

const Servers = () => {
    const { serverInfo } = useGetLiveData()
    // TODO: Needs to be a call to get unique character and guild counts

    const cardIcon = (serverName: string) => {
        const isOnline = serverInfo.data?.[serverName]?.is_online
        if (isOnline === true) {
            return <Checkmark className="shrinkable-icon" />
        } else if (isOnline === false) {
            return <X className="shrinkable-icon" />
        } else {
            return <Pending className="shrinkable-icon" />
        }
    }

    const getServerSelectContent = () => {
        if (
            serverInfo.loadingState === LoadingState.Initial ||
            serverInfo.loadingState === LoadingState.Loading
        ) {
            return SERVER_NAMES_LOWER.sort(([serverNameA], [serverNameB]) =>
                serverNameA.localeCompare(serverNameB)
            ).map((serverName) => (
                <ServerNavigationCard
                    key={serverName}
                    destination={`/grouping/${serverName}`}
                    title={toSentenceCase(serverName)}
                    content="Loading data..."
                    icon={<Pending className="shrinkable-icon" />}
                />
            ))
        }

        return SERVER_NAMES_LOWER.sort(([serverNameA], [serverNameB]) =>
            serverNameA.localeCompare(serverNameB)
        ).map((serverName) => (
            <ServerNavigationCard
                key={serverName}
                destination={`/servers/${serverName}`}
                title={toSentenceCase(serverName)}
                content={
                    <>
                        <span className="orange-text">
                            48,194 unique characters
                        </span>
                        <br />
                        <span className="blue-text">8,109 unique guilds</span>
                    </>
                }
                icon={cardIcon(serverName)}
            />
        ))
    }

    return (
        <Page
            title="Servers"
            description="DDO's server populations, character demographics, content popularity, and long-term trends. Check time zone activity and choose which server is best for you!"
        >
            <ContentCluster title="Select a Server">
                <NavCardCluster>{getServerSelectContent()}</NavCardCluster>
            </ContentCluster>
        </Page>
    )
}

export default Servers
