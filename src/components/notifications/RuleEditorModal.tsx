import React, { useState } from "react"
import { AlertRule } from "../../models/Alert"
import { AlertTypeDefinition } from "../alerts/types"
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
    types: AlertTypeDefinition[]
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

const RuleEditorModal = ({ types, existing, onSave, onClose }: Props) => {
    const [typeName, setTypeName] = useState<string>(
        existing?.type ?? types[0]?.type
    )
    const definition = types.find((t) => t.type === typeName) ?? types[0]
    const [criteria, setCriteria] = useState<unknown>(() =>
        existing ? existing.criteria : definition.defaultCriteria()
    )
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
                    <div className="alert-field">
                        <span className="alert-field-label">
                            Alert me when…
                        </span>
                        <PillRadioGroup
                            ariaLabel="Alert type"
                            options={types.map((t) => ({
                                value: t.type,
                                label: t.label,
                            }))}
                            value={typeName}
                            onChange={(name) => {
                                const next = types.find((t) => t.type === name)
                                if (!next) return
                                setTypeName(name)
                                setCriteria(next.defaultCriteria())
                                setShowErrors(false)
                            }}
                        />
                    </div>
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
