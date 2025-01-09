import React, { useCallback, useEffect, useRef } from "react"
import Page from "../global/Page.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import usePollLfms from "../../hooks/usePollLfms.ts"
import useGetLiveData from "../../hooks/useGetLiveData.ts"
import { Lfm, LfmApiServerModel } from "../../models/Lfm.ts"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import { Link } from "react-router-dom"
// @ts-ignore
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
// @ts-ignore
import { ReactComponent as X } from "../../assets/svg/x.svg"
// @ts-ignore
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import { LoadingState } from "../../models/Api.ts"
import GroupingCanvas from "./GroupingCanvas.tsx"
import { useGroupingContext } from "./GroupingContext.tsx"
import {
    MAXIMUM_GROUPING_PANEL_WIDTH,
    MINIMUM_GROUPING_PANEL_WIDTH,
} from "../../constants/grouping.ts"

const Grouping = () => {
    const { serverInfo } = useGetLiveData()
    const { lfmData } = usePollLfms({ serverName: "", refreshInterval: 10000 })
    const {
        fontSize,
        setFontSize,
        panelWidth,
        setPanelWidth,
        showBoundingBoxes,
        setShowBoundingBoxes,
    } = useGroupingContext()

    const cardDescription = (serverData: LfmApiServerModel) => {
        const serverLfms = serverData.lfms
        const lfmCount = Object.keys(serverLfms).length
        const raidCount = Object.values(serverLfms).filter(
            (lfm) => lfm.quest?.group_size === "Raid"
        ).length
        return (
            <>
                <span style={{ color: "var(--orange-text)" }}>
                    {lfmCount} group{lfmCount === 1 ? "" : "s"}
                </span>
                {raidCount > 0 &&
                    ` | ${raidCount} raid${raidCount === 1 ? "" : "s"}`}
            </>
        )
    }

    const cardIcon = (serverName: string) => {
        const isOnline = serverInfo.data?.[serverName]?.is_online
        if (isOnline === true) {
            return <Checkmark className="icon" />
        } else if (isOnline === false) {
            return <X className="icon" />
        } else {
            return <Pending className="icon" />
        }
    }

    const getCurrentRaids = useCallback(() => {
        const currentRaids: Record<string, Lfm[]> = {}
        Object.entries(lfmData?.data || {}).forEach(
            ([serverName, serverData]: [string, LfmApiServerModel]) => {
                Object.values(serverData.lfms)?.forEach((lfm: Lfm) => {
                    if (lfm.quest?.group_size === "Raid") {
                        const eligibleLfm: Lfm = {
                            ...lfm,
                            is_eligible: true,
                        }
                        if (!currentRaids[serverName]) {
                            currentRaids[serverName] = [eligibleLfm]
                        } else {
                            currentRaids[serverName].push(eligibleLfm)
                        }
                    }
                })
            }
        )
        return currentRaids
    }, [lfmData.data])

    const getServerSelectContent = () => {
        if (
            serverInfo.loadingState === LoadingState.Initial ||
            serverInfo.loadingState === LoadingState.Loading
        ) {
            return SERVER_NAMES_LOWER.sort(([serverNameA], [serverNameB]) =>
                serverNameA.localeCompare(serverNameB)
            ).map((serverName) => (
                <ServerNavigationCard
                    destination={`/grouping/${serverName}`}
                    title={toSentenceCase(serverName)}
                    content="Loading data..."
                    icon={<Pending className="icon" />}
                />
            ))
        }

        if (
            lfmData.loadingState === LoadingState.Initial ||
            lfmData.loadingState === LoadingState.Loading
        ) {
            return SERVER_NAMES_LOWER.sort(([serverNameA], [serverNameB]) =>
                serverNameA.localeCompare(serverNameB)
            ).map((serverName) => (
                <ServerNavigationCard
                    destination={`/grouping/${serverName}`}
                    title={toSentenceCase(serverName)}
                    content="Loading data..."
                    icon={cardIcon(serverName)}
                />
            ))
        }

        return Object.entries(lfmData.data || {})
            .filter(([serverName]) => SERVER_NAMES_LOWER.includes(serverName))
            .sort(([server_name_a], [server_name_b]) =>
                server_name_a.localeCompare(server_name_b)
            )
            .map(([serverName, serverData]) => (
                <ServerNavigationCard
                    destination={`/grouping/${serverName}`}
                    title={toSentenceCase(serverName)}
                    content={cardDescription(serverData)}
                    icon={cardIcon(serverName)}
                />
            ))
    }

    const getCurrentRaidsContent = useCallback(() => {
        if (
            serverInfo.loadingState === LoadingState.Initial ||
            serverInfo.loadingState === LoadingState.Loading ||
            lfmData.loadingState === LoadingState.Initial ||
            lfmData.loadingState === LoadingState.Loading
        ) {
            return <p className="secondary-text">Loading content...</p>
        }

        return Object.entries(getCurrentRaids() || {}).map(
            ([serverName, lfms]: [string, { [key: number]: Lfm }]) => (
                <>
                    <h3>{toSentenceCase(serverName)}</h3>
                    <Link to={`/grouping/${serverName}`}>
                        <GroupingCanvas
                            serverName={serverName}
                            lfms={Object.values(lfms)}
                            raidView
                        />
                    </Link>
                </>
            )
        )
    }, [serverInfo.loadingState, lfmData.loadingState, getCurrentRaids])

    return (
        <Page
            title="DDO Live LFM Viewer"
            description="View a live LFM panel to find public groups - before you even log in! See which groups are currently looking for more players and what content is currently being run."
        >
            <ContentCluster title="Select a Server">
                <div className="nav-card-cluster">
                    {getServerSelectContent()}
                </div>
            </ContentCluster>
            <ContentCluster title="Current Raids">
                <input
                    type="range"
                    min={10}
                    max={20}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                />
                <input
                    type="range"
                    min={MINIMUM_GROUPING_PANEL_WIDTH}
                    max={MAXIMUM_GROUPING_PANEL_WIDTH}
                    value={panelWidth}
                    onChange={(e) => setPanelWidth(parseInt(e.target.value))}
                />
                <input
                    type="checkbox"
                    id="showBoundingBoxes"
                    checked={showBoundingBoxes}
                    onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                />
                <label htmlFor="showBoundingBoxes">Show bounding boxes</label>
                {getCurrentRaidsContent()}
            </ContentCluster>
            <ContentCluster title="Notifications">
                <p>
                    You currently have 0 notification rules set up. Configure
                    rules on the{" "}
                    <Link className="link" to="/notifications">
                        notification settings
                    </Link>{" "}
                    page.
                </p>
            </ContentCluster>
            <ContentCluster title="See Also...">
                <div className="nav-card-cluster">
                    <NavigationCard type="registration" />
                    <NavigationCard type="timers" />
                </div>
            </ContentCluster>
        </Page>
    )
}

export default Grouping
