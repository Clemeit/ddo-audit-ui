import { useCallback, useEffect, useState } from "react"
import usePollApi from "../../hooks/usePollApi.ts"
import { ServerInfo } from "../../models/Game.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { OnlineCharacterIdsApiModel } from "../../models/Character.ts"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import { LoadingState } from "../../models/Api.ts"
import {
    SERVER_NAMES_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../../constants/servers.ts"
import { pluralize, toSentenceCase } from "../../utils/stringUtils.ts"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import Badge from "../global/Badge.tsx"
import {
    DataLoadingErrorPageMessage,
    LiveDataHaultedPageMessage,
} from "../global/CommonMessages.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import useGetFriends from "../../hooks/useGetFriends.ts"
import Skeleton from "../global/Skeleton.tsx"

import { AlphaReleasePageMessage } from "../global/CommonMessages.tsx"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
const Who = () => {
    const { registeredCharacters } = useGetRegisteredCharacters()
    const { friends } = useGetFriends()

    const { data: characterIdsData, state: characterIdsState } =
        usePollApi<OnlineCharacterIdsApiModel>({
            endpoint: "characters/ids",
            interval: 15000,
            lifespan: 1000 * 60 * 60 * 12, // 12 hours
        })
    const { data: serverInfoData, state: serverInfoState } =
        usePollApi<ServerInfoApiDataModel>({
            endpoint: "game/server-info",
            interval: 5000,
            lifespan: 1000 * 60 * 60 * 12, // 12 hours
        })
    const [hasAllDataLoadedOnce, setHasAllDataLoadedOnce] =
        useState<boolean>(false)

    useEffect(() => {
        if (
            characterIdsState === LoadingState.Loaded &&
            serverInfoState === LoadingState.Loaded
        ) {
            setHasAllDataLoadedOnce(true)
        }
    }, [characterIdsState, serverInfoState])

    const isInitialLoading = () => {
        return (
            !hasAllDataLoadedOnce &&
            (serverInfoState === LoadingState.Initial ||
                serverInfoState === LoadingState.Loading ||
                characterIdsState === LoadingState.Initial ||
                characterIdsState === LoadingState.Loading)
        )
    }

    const loadingFailed = () => {
        return (
            serverInfoState === LoadingState.Error ||
            characterIdsState === LoadingState.Error ||
            serverInfoState === LoadingState.Haulted ||
            characterIdsState === LoadingState.Haulted
        )
    }

    const cardIcon = (serverName: string) => {
        const isOnline = serverInfoData?.[serverName]?.is_online
        switch (isOnline) {
            case true:
                return <Checkmark className="shrinkable-icon" />
            case false:
                return <X className="shrinkable-icon" />
            default:
                return <Pending className="shrinkable-icon" />
        }
    }

    const cardDescription = (serverName: string, serverData: ServerInfo) => {
        const characterCount = serverData?.character_count || 0
        const friendCount =
            characterIdsData?.data?.[serverName]?.filter((id) =>
                friends.find((character) => character.id === id)
            ).length || 0
        const areRegisteredCharactersOnline = characterIdsData?.data?.[
            serverName
        ]?.some((id) =>
            registeredCharacters?.some((character) => character.id === id)
        )
        return (
            <>
                <span className="orange-text">
                    {characterCount} {pluralize("character", characterCount)}
                </span>
                {areRegisteredCharactersOnline && (
                    <>
                        {" "}
                        | <span className="blue-text">You</span>
                    </>
                )}
                {friendCount > 0 && (
                    <>
                        {" "}
                        |{" "}
                        <span
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            }}
                            className="green-text"
                        >
                            {friendCount} {pluralize("friend", friendCount)}
                        </span>
                    </>
                )}
            </>
        )
    }

    const cardBadge = (serverName: string) => {
        if (serverInfoData?.[serverName]?.is_vip_only) {
            return (
                <Badge
                    text="VIP"
                    size="small"
                    backgroundColor="var(--orange4)"
                />
            )
        }
        if (SERVERS_64_BITS_LOWER.includes(serverName)) {
            return (
                <Badge
                    text="64-bit"
                    size="small"
                    backgroundColor="var(--magenta3)"
                />
            )
        }
    }

    const getServerSelectContent = useCallback(
        (type: "32bit" | "64bit") => {
            if (isInitialLoading()) {
                const serverList = serverInfoData
                    ? Object.keys(serverInfoData)
                    : SERVER_NAMES_LOWER

                return serverList
                    .filter((serverName) => {
                        if (type === "32bit") {
                            return (
                                SERVERS_64_BITS_LOWER.includes(serverName) ===
                                false
                            )
                        } else if (type === "64bit") {
                            return (
                                SERVERS_64_BITS_LOWER.includes(serverName) ===
                                true
                            )
                        }
                        return true
                    })
                    .sort((serverNameA, serverNameB) =>
                        serverNameA.localeCompare(serverNameB)
                    )
                    .map((serverName) => (
                        <ServerNavigationCard
                            key={serverName}
                            destination={`/who/${serverName}`}
                            title={toSentenceCase(serverName)}
                            content={
                                <Skeleton
                                    width={`${120 + (serverName.length % 3) * 20}px`}
                                />
                            }
                            icon={
                                serverInfoData ? (
                                    cardIcon(serverName)
                                ) : (
                                    <Pending className="shrinkable-icon" />
                                )
                            }
                            badge={cardBadge(serverName)}
                        />
                    ))
            }

            return Object.entries(serverInfoData || {})
                .filter(([serverName]) =>
                    SERVER_NAMES_LOWER.includes(serverName)
                )
                .filter(([serverName]) => {
                    if (type === "32bit") {
                        return (
                            SERVERS_64_BITS_LOWER.includes(serverName) === false
                        )
                    } else if (type === "64bit") {
                        return (
                            SERVERS_64_BITS_LOWER.includes(serverName) === true
                        )
                    }
                    return true
                })
                .sort(([server_name_a], [server_name_b]) =>
                    server_name_a.localeCompare(server_name_b)
                )
                .map(([serverName, serverData]) => (
                    <ServerNavigationCard
                        key={serverName}
                        destination={`/who/${serverName}`}
                        title={toSentenceCase(serverName)}
                        content={cardDescription(serverName, serverData)}
                        icon={cardIcon(serverName)}
                        badge={cardBadge(serverName)}
                    />
                ))
        },
        [serverInfoData, serverInfoState, registeredCharacters, cardDescription]
    )

    const [hideAlphaRelease, setHideAlphaRelease] = useBooleanFlag(
        BOOLEAN_FLAGS.hideAlphaRelease
    )

    return (
        <Page
            title="DDO Live Character Viewer"
            description="Browse players from any server with a live character viewer. Are your friends online? Is your guild forming up for a late-night raid? Now you know!"
            logo="/icons/who-192px.png"
        >
            {!hideAlphaRelease && (
                <div className="alpha-release-message">
                    <AlphaReleasePageMessage
                        onDismiss={() => {
                            setHideAlphaRelease(true)
                        }}
                    />
                </div>
            )}
            {loadingFailed() && <DataLoadingErrorPageMessage />}
            {serverInfoState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            <ContentClusterGroup>
                <ContentCluster title="Select a Server">
                    <NavCardCluster>
                        {getServerSelectContent("64bit")}
                    </NavCardCluster>
                    <hr />
                    <NavCardCluster>
                        {getServerSelectContent("32bit")}
                    </NavCardCluster>
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="friends" />
                        <NavigationCard type="ignores" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Who
