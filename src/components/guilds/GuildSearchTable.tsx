import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { GuildByNameData } from "../../models/Guilds.ts"
import "./GuildSearchTable.css"
import Button from "../global/Button.tsx"
import { ReactComponent as ChevronRight } from "../../assets/svg/chevron-right.svg"
import useIsMobile from "../../hooks/useIsMobile.ts"
import { useNavigate } from "react-router-dom"
import logMessage from "../../utils/logUtils.ts"

interface Props {
    guilds: GuildByNameData[]
    searchQuery?: string
    isLoading?: boolean
    maxBodyHeight?: number | string
    renderExpandedContent?: (guild: GuildByNameData) => Promise<ReactNode>
}

const GuildSearchTable = ({
    guilds,
    searchQuery,
    isLoading,
    maxBodyHeight,
    renderExpandedContent,
}: Props) => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set())
    const isMobile = useIsMobile()
    const navigate = useNavigate()

    useEffect(() => {
        setExpanded(new Set())
    }, [searchQuery, guilds])

    const getRowKey = (g: GuildByNameData) =>
        `${g.guild_name}__${g.server_name}`

    const containerStyle: CSSProperties | undefined =
        maxBodyHeight !== undefined && expanded.size === 0
            ? {
                  maxHeight:
                      typeof maxBodyHeight === "number"
                          ? `${maxBodyHeight}px`
                          : maxBodyHeight,
              }
            : undefined

    // Store expanded content for each row
    const [expandedContent, setExpandedContent] = useState<
        Record<string, ReactNode>
    >({})

    useEffect(() => {
        // For each expanded row, fetch content if not already loaded
        if (renderExpandedContent) {
            expanded.forEach(async (key) => {
                if (!expandedContent[key]) {
                    const guild = guilds.find((g) => getRowKey(g) === key)
                    if (guild) {
                        const content = await renderExpandedContent(guild)
                        setExpandedContent((prev) => ({
                            ...prev,
                            [key]: content,
                        }))
                    }
                }
            })
        }
    }, [expanded, renderExpandedContent, guilds])

    const handleNavigateToGuild = (guildName: string, serverName: string) => {
        navigate(
            `/guilds/${serverName?.toLowerCase()}/${encodeURIComponent(guildName?.toLowerCase())}`
        )
        logMessage("User navigating to guild", "info", {
            metadata: { guildName, serverName },
        })
    }

    const getTableContent = () => {
        if (guilds.length === 0) {
            return (
                <tr>
                    <td className="no-data-row" colSpan={4}>
                        {searchQuery
                            ? `No guilds found for "${searchQuery}"`
                            : "No guilds to display"}
                    </td>
                </tr>
            )
        }

        return guilds
            .filter(
                (guild) => expanded.size === 0 || expanded.has(getRowKey(guild))
            )
            .flatMap((guild) => {
                const key = getRowKey(guild)
                const isExpanded = expanded.has(key)

                return (
                    <tr
                        key={key}
                        className={isExpanded ? "is-expanded" : undefined}
                        onClick={() =>
                            handleNavigateToGuild(
                                guild.guild_name,
                                guild.server_name
                            )
                        }
                    >
                        <td>{guild.guild_name}</td>
                        <td>{guild.server_name}</td>
                        <td>{guild.character_count}</td>
                        {!isMobile && (
                            <td className="expand-cell">
                                <ChevronRight
                                    className="expand-icon"
                                    aria-hidden="true"
                                />
                            </td>
                        )}
                    </tr>
                )
            })
    }

    return (
        <div className="guild-search-table-container" style={containerStyle}>
            <table
                className={`guild-search-table  ${isLoading ? "loading" : ""}`}
            >
                <thead>
                    <tr>
                        <th>Guild Name</th>
                        <th>Server Name</th>
                        <th>Count</th>
                        {!isMobile && (
                            <th className="expand-header" aria-label="Expand" />
                        )}
                    </tr>
                </thead>
                <tbody>{getTableContent()}</tbody>
            </table>
        </div>
    )
}

export default GuildSearchTable
