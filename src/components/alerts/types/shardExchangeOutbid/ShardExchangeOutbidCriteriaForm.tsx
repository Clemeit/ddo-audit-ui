import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { ShardExchangeOutbidCriteria } from "../../../../models/Alert"
import { useRegisteredCharactersContext } from "../../../../contexts/RegisteredCharactersContext"
import PillToggleGroup from "../../../global/PillToggleGroup"
import type { CriteriaFormProps } from "../index"

const ShardExchangeOutbidCriteriaForm = ({
    criteria,
    onChange,
}: CriteriaFormProps<ShardExchangeOutbidCriteria>) => {
    const { verifiedCharacters } = useRegisteredCharactersContext()

    const options = useMemo(
        () =>
            [...verifiedCharacters]
                .filter((c) => c.id != null)
                .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
                .map((c) => ({
                    value: String(c.id),
                    label: c.server_name
                        ? `${c.name} (${c.server_name})`
                        : (c.name ?? "Unknown character"),
                })),
        [verifiedCharacters]
    )

    return (
        <div className="alert-form">
            <div className="alert-field">
                <span className="alert-field-label">Characters</span>
                {verifiedCharacters.length === 0 ? (
                    <span className="alert-field-hint">
                        You don&rsquo;t have any verified characters yet.{" "}
                        <Link to="/registration">Verify a character</Link> so
                        DDO Audit can tell which bids are yours.
                    </span>
                ) : (
                    <PillToggleGroup
                        ariaLabel="Characters"
                        anyLabel="All my verified characters"
                        options={options}
                        selected={(criteria.character_ids ?? []).map(String)}
                        onChange={(ids) =>
                            onChange({ character_ids: ids.map(Number) })
                        }
                    />
                )}
                <span className="alert-field-hint">
                    The exchange is checked about once an hour, so an outbid
                    alert can arrive up to an hour after it happens.
                </span>
            </div>
        </div>
    )
}

export default ShardExchangeOutbidCriteriaForm
