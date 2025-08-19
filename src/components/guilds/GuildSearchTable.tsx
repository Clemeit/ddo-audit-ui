import { GuildByNameData } from "../../models/Guilds.ts"
import "./GuildSearchTable.css"

interface Props {
    guilds: GuildByNameData[]
    searchQuery?: string
    isLoading?: boolean
}

const GuildSearchTable = ({ guilds, searchQuery, isLoading }: Props) => {
    const getTableContent = () => {
        if (isLoading && searchQuery) {
            return (
                <tr>
                    <td colSpan={4} className="no-data-row">
                        Loading data...
                    </td>
                </tr>
            )
        }

        if ((guilds.length === 0 && !!searchQuery) || !searchQuery) {
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

        if (guilds.length === 0) {
            return (
                <tr>
                    <td className="no-data-row" colSpan={4}>
                        No guilds to display
                    </td>
                </tr>
            )
        }

        return guilds.map((guild, index) => (
            <tr key={index}>
                <td>{guild.guild_name}</td>
                <td>{guild.server_name}</td>
                <td>{guild.character_count}</td>
                <td>
                    {new Date(
                        guild.avg_top_10_percent_last_update_epoch * 1000
                    ).toLocaleDateString()}
                </td>
            </tr>
        ))
    }

    return (
        <table className="guild-search-table">
            <thead>
                <tr>
                    <th>Guild Name</th>
                    <th>Server Name</th>
                    <th>Character Count</th>
                    <th>Last Average Activity</th>
                </tr>
            </thead>
            <tbody>{getTableContent()}</tbody>
        </table>
    )
}

export default GuildSearchTable
