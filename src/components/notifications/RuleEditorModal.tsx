import React, { useState } from "react"
import { AlertRule } from "../../models/Alert"
import {
    ALERT_GROUPS,
    AlertTypeDefinition,
    getAlertTypeDefinition,
} from "../alerts/types"
import Modal from "../modal/Modal"
import Button from "../global/Button"
import ValidationMessage from "../global/ValidationMessage"
import { PillRadioGroup } from "../global/PillToggleGroup"
import {
    ExpiryPreset,
    expiryFromPreset,
    formatExpiry,
    isExpired,
} from "../../utils/alertExpiry"

interface Props {
    // The types to offer when creating (the picker shows when there is more than one).
    types: AlertTypeDefinition[]
    // A type to start on, and criteria to start with (e.g. from a link to /notifications).
    initialType?: string
    initialCriteria?: unknown
    existing?: AlertRule
    onSave: (
        definition: AlertTypeDefinition,
        criteria: unknown,
        expiresAt: string | null
    ) => Promise<boolean>
    onClose: () => void
}

const EXPIRY_OPTIONS: { value: ExpiryPreset; label: string }[] = [
    { value: "never", label: "Never" },
    { value: "3h", label: "In 3 hours" },
    { value: "24h", label: "In 24 hours" },
    { value: "7d", label: "In 7 days" },
]

const RuleEditorModal = ({
    types,
    initialType,
    initialCriteria,
    existing,
    onSave,
    onClose,
}: Props) => {
    const [typeName, setTypeName] = useState<string>(
        existing?.type ??
            (types.some((t) => t.type === initialType)
                ? initialType!
                : types[0]?.type)
    )
    // An existing rule keeps its own type even if that type isn't offered for new alerts.
    const definition =
        (existing && getAlertTypeDefinition(existing.type)) ||
        types.find((t) => t.type === typeName) ||
        types[0]
    const [criteria, setCriteria] = useState<unknown>(() => {
        if (existing) return existing.criteria
        const defaults = definition.defaultCriteria()
        return initialCriteria && definition.type === initialType
            ? { ...defaults, ...(initialCriteria as object) }
            : defaults
    })
    // An unexpired end time can be kept as-is; an expired rule needs a new one.
    const canKeepExpiry =
        !!existing?.expires_at && !isExpired(existing.expires_at)
    const [expiry, setExpiry] = useState<ExpiryPreset>(
        canKeepExpiry ? "keep" : "never"
    )
    const [showErrors, setShowErrors] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const problem = definition.validate(criteria)
    const isRenewal = !!existing && isExpired(existing.expires_at)
    const title = isRenewal
        ? "Renew alert"
        : existing
          ? "Edit alert"
          : "New alert"

    const expiryOptions: { value: ExpiryPreset; label: string }[] =
        canKeepExpiry
            ? [
                  {
                      value: "keep",
                      label: `Keep (${formatExpiry(existing!.expires_at)?.toLowerCase()})`,
                  },
                  ...EXPIRY_OPTIONS,
              ]
            : EXPIRY_OPTIONS

    const save = async () => {
        if (problem) {
            setShowErrors(true)
            return
        }
        setIsSaving(true)
        const saved = await onSave(
            definition,
            criteria,
            expiryFromPreset(expiry, existing?.expires_at ?? null)
        )
        // On success the parent closes the dialog (and this component unmounts).
        if (!saved) setIsSaving(false)
    }

    const Form = definition.CriteriaForm

    return (
        <Modal
            onClose={onClose}
            maxWidth="580px"
            fullScreenOnMobile
            freezeBodyScroll
            ariaLabel={title}
            className="alert-editor-modal"
        >
            <div className="alert-editor">
                <h2 className="alert-editor-title">{title}</h2>
                {!existing && types.length > 1 && (
                    <fieldset className="alert-field alert-type-picker">
                        <legend className="alert-field-label">
                            Alert me when…
                        </legend>
                        {ALERT_GROUPS.map((group) => {
                            const groupTypes = types.filter(
                                (t) => t.group === group.name
                            )
                            if (!groupTypes.length) return null
                            return (
                                <div
                                    key={group.name}
                                    className="alert-type-group"
                                >
                                    <span className="alert-type-group-title">
                                        {group.title}
                                    </span>
                                    {groupTypes.map((t) => (
                                        <label
                                            key={t.type}
                                            className={`alert-type-option ${t.type === typeName ? "selected" : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="alert-type"
                                                value={t.type}
                                                checked={t.type === typeName}
                                                onChange={() => {
                                                    setTypeName(t.type)
                                                    setCriteria(
                                                        t.defaultCriteria()
                                                    )
                                                    setShowErrors(false)
                                                }}
                                            />
                                            {t.pickerLabel}
                                        </label>
                                    ))}
                                </div>
                            )
                        })}
                    </fieldset>
                )}
                <p className="alert-editor-description">
                    {definition.description}
                </p>

                <Form criteria={criteria} onChange={setCriteria} />

                <div className="alert-field">
                    <span className="alert-field-label">Stop alerting</span>
                    <PillRadioGroup<ExpiryPreset>
                        ariaLabel="Stop alerting"
                        options={expiryOptions}
                        value={expiry}
                        onChange={setExpiry}
                    />
                </div>

                <div className="alert-editor-footer">
                    <ValidationMessage
                        visible={showErrors && !!problem}
                        message={problem ?? ""}
                    />
                    <div className="alert-editor-actions">
                        <Button
                            type="secondary"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={save}
                            disabled={isSaving}
                        >
                            {isSaving
                                ? "Saving…"
                                : existing
                                  ? isRenewal
                                      ? "Renew alert"
                                      : "Save changes"
                                  : "Create alert"}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default RuleEditorModal
