import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { GuildByNameData } from "../../models/Guilds.ts"
import { ReactComponent as ExpandSVG } from "../../assets/svg/expand.svg"
import { ReactComponent as ContractSVG } from "../../assets/svg/contract.svg"
import "./GuildSearchTable.css"
import Button from "../global/Button.tsx"

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

    const getRowKey = (g: GuildByNameData) =>
        `${g.guild_name}__${g.server_name}`

    const toggleRow = (key: string) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(key)) {
                next.delete(key)
            } else {
                next.add(key)
            }
            return next
        })
    }

    const containerStyle: CSSProperties | undefined =
        maxBodyHeight !== undefined
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

        return guilds.flatMap((guild) => {
            const key = getRowKey(guild)
            const isExpanded = expanded.has(key)

            const mainRow = (
                <tr
                    key={key}
                    className={isExpanded ? "is-expanded" : undefined}
                >
                    <td>{guild.guild_name}</td>
                    <td>{guild.server_name}</td>
                    <td>{guild.character_count}</td>
                    <td className="expand-cell">
                        <Button
                            className="expand-button"
                            type="tertiary"
                            aria-expanded={isExpanded}
                            aria-label={
                                isExpanded ? "Collapse row" : "Expand row"
                            }
                            onClick={() => toggleRow(key)}
                            icon={isExpanded ? <ContractSVG /> : <ExpandSVG />}
                        />
                    </td>
                </tr>
            )

            const expandedRow = isExpanded ? (
                <tr key={`${key}__expanded`} className="expanded-row">
                    <td colSpan={4}>
                        {renderExpandedContent ? (
                            (expandedContent[key] ?? (
                                <div className="expanded-placeholder">
                                    Loading details...
                                </div>
                            ))
                        ) : (
                            <div className="expanded-placeholder">
                                No details to display.
                            </div>
                        )}
                    </td>
                </tr>
            ) : null

            return expandedRow ? [mainRow, expandedRow] : [mainRow]
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
                        <th>Character Count</th>
                        <th className="expand-header" aria-label="Expand" />
                    </tr>
                </thead>
                <tbody>{getTableContent()}</tbody>
            </table>
        </div>
    )
}

export default GuildSearchTable
