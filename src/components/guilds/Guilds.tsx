import React, { useEffect, useRef } from "react"
import Page from "../global/Page.tsx"
import { ContentCluster, ContentClusterGroup } from "../global/ContentCluster"
import { WIPPageMessage } from "../global/CommonMessages.tsx"
import useIsMobile from "../../hooks/useIsMobile.ts"
import Stack from "../global/Stack.tsx"
import { getGuildsByName } from "../../services/guildService.ts"
import useDebounce from "../../hooks/useDebounce.ts"
import { GuildByNameData } from "../../models/Guilds.ts"
import GuildSearchTable from "./GuildSearchTable.tsx"
import Badge from "../global/Badge.tsx"
import CharacterTable from "../tables/CharacterTable.tsx"
import ColoredText from "../global/ColoredText.tsx"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"

const Guilds = () => {
    const isMobile = useIsMobile()
    const [guildName, setGuildName] = React.useState("")
    const [foundGuilds, setFoundGuilds] = React.useState<GuildByNameData[]>([])
    const isLoading = useRef<boolean>(false)

    const {
        debouncedValue: debouncedGuildName,
        refreshDebounce: refreshGuildName,
    } = useDebounce(guildName, 1000)

    useEffect(() => {
        if (debouncedGuildName) {
            getGuildByName(debouncedGuildName)
        } else {
            setFoundGuilds([])
        }
        isLoading.current = false
    }, [debouncedGuildName])

    const getGuildByName = async (guildName: string) => {
        try {
            const response = await getGuildsByName(guildName)
            if (response && response.data) {
                setFoundGuilds(response.data)
            } else {
                setFoundGuilds([])
            }
        } catch (error) {
            setFoundGuilds([])
        }
    }

    return (
        <Page
            title="DDO Guilds"
            description="A page where you can search for DDO guilds, view their stats, and see members of your guild if you have a registered character."
        >
            <div
                style={{ transform: isMobile ? "unset" : "translateY(-13px)" }}
            >
                <WIPPageMessage />
            </div>
            <ContentClusterGroup>
                <ContentCluster
                    title="Guild Search"
                    subtitle="Search for guilds by name to view member count and recent activity."
                >
                    <Stack direction="column" gap="20px">
                        <Stack direction="column" gap="2px">
                            <label
                                htmlFor="guild-search"
                                className="label"
                                style={{
                                    color: "var(--secondary-text)",
                                    fontWeight: "bold",
                                }}
                            >
                                Guild Name
                            </label>
                            <input
                                type="text"
                                placeholder="Search for a guild..."
                                className="input"
                                id="guild-search"
                                value={guildName}
                                onChange={(e) => {
                                    isLoading.current = true
                                    setGuildName(e.target.value)
                                }}
                                onBlur={refreshGuildName}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        refreshGuildName()
                                    }
                                }}
                            />
                        </Stack>
                        <GuildSearchTable
                            guilds={foundGuilds}
                            searchQuery={guildName}
                            isLoading={isLoading.current}
                        />
                    </Stack>
                    <div
                        style={{
                            marginTop: "5px",
                        }}
                    >
                        <InfoSVG
                            className="page-message-icon"
                            style={{ fill: `var(--info)` }}
                        />
                        <ColoredText color="secondary">
                            Top 20 guilds are displayed. Numbers are estimates.
                        </ColoredText>
                    </div>
                </ContentCluster>
                <div
                    style={{
                        opacity: 0.5,
                        pointerEvents: "none",
                    }}
                >
                    <ContentCluster
                        title="Detailed Guild Information"
                        subtitle="Select one of your characters' guilds to view detailed information."
                        badge={<Badge type="soon" text="Soon" />}
                    >
                        <Stack direction="column" gap="20px" width="100%">
                            <Stack direction="column" gap="2px">
                                <label
                                    htmlFor="guild-select"
                                    className="label"
                                    style={{
                                        color: "var(--secondary-text)",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Your Guilds
                                </label>
                                <select
                                    id="guild-select"
                                    className="input"
                                    disabled
                                >
                                    <option value="">Select a guild...</option>
                                </select>
                            </Stack>
                            <div style={{ width: "100%" }}>
                                <CharacterTable
                                    characterRows={[]}
                                    isLoaded={true}
                                    noCharactersMessage="No guild selected"
                                />
                            </div>
                        </Stack>
                    </ContentCluster>
                </div>
            </ContentClusterGroup>
        </Page>
    )
}

export default Guilds
