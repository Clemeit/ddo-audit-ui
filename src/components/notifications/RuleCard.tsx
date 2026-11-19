import React, { useState } from "react"
import { AlertRule } from "../../models/Alert"
import { getAlertTypeDefinition, SummaryHelpers } from "../alerts/types"
import Switch from "../global/Switch"
import Button from "../global/Button"
import { formatExpiry, isExpired } from "../../utils/alertExpiry"
import { ReactComponent as EditSVG } from "../../assets/svg/edit.svg"
import { ReactComponent as DeleteSVG } from "../../assets/svg/delete.svg"

interface Props {
    rule: AlertRule
    helpers: SummaryHelpers
    busy: boolean
    onToggle: (rule: AlertRule) => void
    onEdit: (rule: AlertRule) => void
    onDelete: (rule: AlertRule) => void
}

const RuleCard = ({
    rule,
    helpers,
    busy,
    onToggle,
    onEdit,
    onDelete,
}: Props) => {
    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const definition = getAlertTypeDefinition(rule.type)
    const expired = isExpired(rule.expires_at)
    const expiry = formatExpiry(rule.expires_at)
    const { title, chips } = definition
        ? definition.describe(rule.criteria, helpers)
        : { title: rule.type, chips: [] }
    const active = rule.enabled && !expired

    return (
        <li
            className={`alert-rule-card ${active ? "" : "alert-rule-card-inactive"}`}
        >
            <div className="alert-rule-main">
                <span className="alert-rule-kind">
                    {definition?.label ?? "Alert"}
                    {!rule.enabled && !expired && " · Paused"}
                </span>
                <span className="alert-rule-title">{title}</span>
                <ul className="alert-rule-chips">
                    {chips.map((chip) => (
                        <li key={chip} className="alert-rule-chip">
                            {chip}
                        </li>
                    ))}
                    {expiry && (
                        <li
                            className={`alert-rule-chip ${expired ? "alert-rule-chip-expired" : "alert-rule-chip-expiry"}`}
                        >
                            {expiry}
                        </li>
                    )}
                </ul>
                {!definition && (
                    <span className="secondary-text">
                        This alert type can't be edited on this page yet.
                    </span>
                )}
            </div>

            {confirmingDelete ? (
                <div className="alert-rule-confirm" role="group">
                    <span>Delete this alert?</span>
                    <Button
                        type="secondary"
                        small
                        className="critical"
                        disabled={busy}
                        onClick={() => onDelete(rule)}
                    >
                        Delete
                    </Button>
                    <Button
                        type="text"
                        small
                        disabled={busy}
                        onClick={() => setConfirmingDelete(false)}
                    >
                        Cancel
                    </Button>
                </div>
            ) : (
                <div className="alert-rule-controls">
                    {expired ? (
                        definition && (
                            <Button
                                type="secondary"
                                small
                                disabled={busy}
                                onClick={() => onEdit(rule)}
                            >
                                Renew
                            </Button>
                        )
                    ) : (
                        <Switch
                            checked={rule.enabled}
                            disabled={busy}
                            onChange={() => onToggle(rule)}
                            label={
                                rule.enabled ? "Pause alert" : "Resume alert"
                            }
                        />
                    )}
                    {definition && !expired && (
                        <button
                            type="button"
                            className="icon-button"
                            disabled={busy}
                            onClick={() => onEdit(rule)}
                            aria-label="Edit alert"
                            title="Edit"
                        >
                            <EditSVG />
                        </button>
                    )}
                    <button
                        type="button"
                        className="icon-button"
                        disabled={busy}
                        onClick={() => setConfirmingDelete(true)}
                        aria-label="Delete alert"
                        title="Delete"
                    >
                        <DeleteSVG />
                    </button>
                </div>
            )}
        </li>
    )
}

export default RuleCard
