import React from "react"
import { ServerStatusCriteria } from "../../../../models/Alert"
import Checkbox from "../../../global/Checkbox"
import ServerPills from "../../shared/ServerPills"
import type { CriteriaFormProps } from "../index"

const ServerStatusCriteriaForm = ({
    criteria,
    onChange,
}: CriteriaFormProps<ServerStatusCriteria>) => {
    const set = (patch: Partial<ServerStatusCriteria>) =>
        onChange({ ...criteria, ...patch })

    return (
        <div className="alert-form">
            <ServerPills
                selected={criteria.server_names}
                onChange={(server_names) => set({ server_names })}
            />
            <div className="alert-field">
                <span className="alert-field-label">Alert me when it</span>
                <Checkbox
                    checked={criteria.on_offline}
                    onChange={(e) => set({ on_offline: e.target.checked })}
                >
                    Goes offline
                </Checkbox>
                <Checkbox
                    checked={criteria.on_online}
                    onChange={(e) => set({ on_online: e.target.checked })}
                >
                    Comes back online
                </Checkbox>
            </div>
        </div>
    )
}

export default ServerStatusCriteriaForm
