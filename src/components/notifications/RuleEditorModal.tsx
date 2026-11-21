import React, { useEffect, useRef, useState } from "react"
import { AlertRule } from "../../models/Alert"
import {
    ALERT_GROUPS,
    AlertTypeDefinition,
    findDuplicateRule,
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
    // The user's rules, to catch a new or edited rule that duplicates one of them.
    rules: AlertRule[]
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

// Point at the matching rule's state, since that's usually why someone tries to add it again.
const duplicateMessage = (rule: AlertRule | undefined): string | null => {
    if (!rule) return null
    if (isExpired(rule.expires_at))
        return "You already have this alert, but it has ended. Renew that one instead."
    if (!rule.enabled)
        return "You already have this alert, but it's turned off. Turn that one back on instead."
    return "You already have this alert."
}

const RuleEditorModal = ({
    types,
    rules,
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

    // Creating with more than one type to choose from is two steps: pick a type, then set it
    // up. A link that names the type (initialType) skips straight to setting it up.
    const canPickType = !existing && types.length > 1
    const [step, setStep] = useState<"type" | "setup">(
        canPickType && !types.some((t) => t.type === initialType)
            ? "type"
            : "setup"
    )
    // Which way the step transition slides; null on first render so nothing animates on open.
    const [direction, setDirection] = useState<"forward" | "back" | null>(null)
    const stepHeadingRef = useRef<HTMLHeadingElement>(null)
    useEffect(() => {
        if (direction) stepHeadingRef.current?.focus()
    }, [step, direction])

    const chooseType = (t: AlertTypeDefinition) => {
        // Re-picking the same type keeps whatever was already filled in.
        if (t.type !== typeName) {
            setTypeName(t.type)
            setCriteria(t.defaultCriteria())
            setShowErrors(false)
        }
        setDirection("forward")
        setStep("setup")
    }

    const goBack = () => {
        setDirection("back")
        setStep("type")
    }

    const duplicate = findDuplicateRule(
        rules,
        definition,
        criteria,
        existing?.id
    )
    const problem = definition.validate(criteria) ?? duplicateMessage(duplicate)
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
            <div
                key={step}
                className={`alert-editor${direction ? ` alert-editor-step-${direction}` : ""}`}
            >
                {step === "type" ? (
                    <>
                        <div className="alert-editor-heading">
                            <span className="alert-editor-step">
                                Step 1 of 2
                            </span>
                            <h2
                                className="alert-editor-title"
                                ref={stepHeadingRef}
                                tabIndex={-1}
                            >
                                What should we alert you about?
                            </h2>
                        </div>
                        <div className="alert-type-picker">
                            {ALERT_GROUPS.map((group) => {
                                const groupTypes = types.filter(
                                    (t) => t.group === group.name
                                )
                                if (!groupTypes.length) return null
                                return (
                                    <section
                                        key={group.name}
                                        className="alert-type-group"
                                        aria-label={group.title}
                                    >
                                        <span className="alert-type-group-title">
                                            {group.title}
                                        </span>
                                        {groupTypes.map((t) => (
                                            <button
                                                key={t.type}
                                                type="button"
                                                className={`alert-type-option${t.type === typeName && direction ? " selected" : ""}`}
                                                onClick={() => chooseType(t)}
                                            >
                                                <span className="alert-type-option-text">
                                                    <span className="alert-type-option-label">
                                                        {t.pickerLabel}
                                                    </span>
                                                    <span className="alert-type-option-description">
                                                        {t.description}
                                                    </span>
                                                </span>
                                                <span
                                                    className="alert-type-option-chevron"
                                                    aria-hidden="true"
                                                >
                                                    ›
                                                </span>
                                            </button>
                                        ))}
                                    </section>
                                )
                            })}
                        </div>
                        <div className="alert-editor-footer">
                            <div className="alert-editor-actions">
                                <Button type="secondary" onClick={onClose}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="alert-editor-heading">
                            {canPickType && (
                                <span className="alert-editor-step">
                                    Step 2 of 2
                                </span>
                            )}
                            <h2
                                className="alert-editor-title"
                                ref={stepHeadingRef}
                                tabIndex={-1}
                            >
                                {existing ? title : definition.pickerLabel}
                            </h2>
                            <p className="alert-editor-description">
                                {definition.description}
                            </p>
                        </div>

                        <Form criteria={criteria} onChange={setCriteria} />

                        <div className="alert-field">
                            <span className="alert-field-label">
                                Stop alerting
                            </span>
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
                                {canPickType && (
                                    <Button
                                        type="secondary"
                                        onClick={goBack}
                                        disabled={isSaving}
                                        className="alert-editor-back"
                                    >
                                        Back
                                    </Button>
                                )}
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
                    </>
                )}
            </div>
        </Modal>
    )
}

export default RuleEditorModal
