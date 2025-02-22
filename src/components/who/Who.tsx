import React, { useCallback } from "react"
import usePollApi from "../../hooks/usePollApi.ts"
import { CharacterSummaryApiDataModel } from "../../models/Character.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import Page from "../global/Page.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import { LoadingState } from "../../models/Api.ts"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { pluralize, toSentenceCase } from "../../utils/stringUtils.ts"
// @ts-expect-error NOFIX
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
// @ts-expect-error NOFIX
import { ReactComponent as X } from "../../assets/svg/x.svg"
// @ts-expect-error NOFIX
import { ReactComponent as Pending } from "../../assets/svg/pending.svg"
import Badge from "../global/Badge.tsx"
import { LiveDataHaultedPageMessage } from "../global/CommonMessages.tsx"
import NavigationCard from "../global/NavigationCard.tsx"

const Who = () => {
    const { data: characterData, state: characterState } =
        usePollApi<CharacterSummaryApiDataModel>({
            endpoint: "characters/summary",
            interval: 10000,
            lifespan: 1000 * 60 * 60 * 12, // 12 hours
        })
    const { data: serverInfoData, state: serverInfoState } =
        usePollApi<ServerInfoApiDataModel>({
            endpoint: "game/server-info",
            interval: 10000,
            lifespan: 1000 * 60 * 60 * 12, // 12 hours
        })

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

    const cardDescription = (serverName: string) => {
        const characterCount = characterData?.[serverName]?.character_count
        return (
            <span className="orange-text">
                {characterCount} {pluralize("character", characterCount)}
            </span>
        )
    }

    const cardBadge = (serverName: string) => {
        return (
            serverInfoData?.[serverName]?.is_vip_only && (
                <Badge
                    text="VIP"
                    size="small"
                    backgroundColor="var(--orange4)"
                />
            )
        )
    }

    const getServerSelectContent = useCallback(() => {
        if (
            serverInfoState === LoadingState.Initial ||
            serverInfoState === LoadingState.Loading
        ) {
            // server info not yet loaded
            return SERVER_NAMES_LOWER.sort((a, b) => a.localeCompare(b)).map(
                (serverName) => (
                    <ServerNavigationCard
                        key={serverName}
                        destination={`/who/${serverName}`}
                        title={toSentenceCase(serverName)}
                        content="Loading data..."
                        icon={<Pending className="shrinkable-icon" />}
                    />
                )
            )
        }

        if (
            characterState === LoadingState.Initial ||
            characterState === LoadingState.Loading
        ) {
            return Object.keys(serverInfoData || {})
                .sort((a, b) => a.localeCompare(b))
                .map((serverName) => (
                    <ServerNavigationCard
                        key={serverName}
                        destination={`/who/${serverName}`}
                        title={toSentenceCase(serverName)}
                        content="Loading data..."
                        icon={cardIcon(serverName)}
                    />
                ))
        }

        return Object.keys(characterData || {})
            .sort((a, b) => a.localeCompare(b))
            .map((serverName) => (
                <ServerNavigationCard
                    key={serverName}
                    destination={`/who/${serverName}`}
                    title={toSentenceCase(serverName)}
                    content={cardDescription(serverName)}
                    icon={cardIcon(serverName)}
                    badge={cardBadge(serverName)}
                />
            ))
    }, [characterData, characterState, serverInfoData, serverInfoState])

    return (
        <Page
            title="DDO Live Character Viewer"
            description="Browse players from any server with a live character viewer. Are your friends online? Is your guild forming up for a late-night raid? Now you know!"
        >
            {characterState === LoadingState.Haulted && (
                <LiveDataHaultedPageMessage />
            )}
            <ContentCluster title="Select a Server">
                <NavCardCluster>{getServerSelectContent()}</NavCardCluster>
            </ContentCluster>
            <ContentCluster title="See Also...">
                <NavCardCluster>
                    <NavigationCard type="friends" />
                </NavCardCluster>
            </ContentCluster>
        </Page>
    )
}

export default Who
