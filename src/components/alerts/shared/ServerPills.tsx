import React from "react"
import { SERVERS_64_BITS } from "../../../constants/servers"
import PillToggleGroup from "../../global/PillToggleGroup"

const SERVER_OPTIONS = [...SERVERS_64_BITS]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value }))

interface Props {
    selected: string[]
    onChange: (serverNames: string[]) => void
    label?: string
}

/** Server filter used by several alert forms. Nothing selected means any server. */
const ServerPills = ({ selected, onChange, label = "Servers" }: Props) => (
    <div className="alert-field">
        <span className="alert-field-label">{label}</span>
        <PillToggleGroup
            ariaLabel={label}
            anyLabel="Any server"
            options={SERVER_OPTIONS}
            selected={selected}
            onChange={onChange}
        />
    </div>
)

/** "Thrane, Cormyr", or "Any server" when the list is empty. */
function serversText(serverNames: string[] | undefined): string {
    return serverNames?.length ? serverNames.join(", ") : "Any server"
}

export default ServerPills
export { serversText }
