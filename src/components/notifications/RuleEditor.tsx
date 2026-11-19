import { useState } from "react"
import { AlertRule } from "../../models/Alert"
import { AlertTypeDefinition } from "../alerts/types"
import Button from "../global/Button"
import Stack from "../global/Stack"
import Select from "../global/Select"
import ValidationMessage from "../global/ValidationMessage"

interface Props {
    types: AlertTypeDefinition[]
    existing?: AlertRule
    onSave: (
        definition: AlertTypeDefinition,
        criteria: unknown
    ) => Promise<void>
    onCancel: () => void
}

const RuleEditor = ({ types, existing, onSave, onCancel }: Props) => {
    const [typeName, setTypeName] = useState<string>(
        existing?.type ?? types[0]?.type
    )
    const definition = types.find((t) => t.type === typeName) ?? types[0]
    const [criteria, setCriteria] = useState<unknown>(() =>
        existing ? existing.criteria : definition.defaultCriteria()
    )
    const [showErrors, setShowErrors] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const problem = definition.validate(criteria)

    const changeType = (name: string) => {
        const next = types.find((t) => t.type === name)
        if (!next) return
        setTypeName(name)
        setCriteria(next.defaultCriteria())
        setShowErrors(false)
    }

    const save = async () => {
        if (problem) {
            setShowErrors(true)
            return
        }
        setIsSaving(true)
        try {
            await onSave(definition, criteria)
        } finally {
            setIsSaving(false)
        }
    }

    const Form = definition.CriteriaForm

    return (
        <Stack direction="column" gap="20px">
            {!existing && types.length > 1 && (
                <Stack direction="column" gap="6px">
                    <label htmlFor="alert-type" className="input-label">
                        Alert me…
                    </label>
                    <Select
                        id="alert-type"
                        value={typeName}
                        onChange={(e) => changeType(e.target.value)}
                    >
                        {types.map((t) => (
                            <option key={t.type} value={t.type}>
                                {t.label}
                            </option>
                        ))}
                    </Select>
                </Stack>
            )}
            <p className="secondary-text" style={{ margin: 0 }}>
                {definition.description}
            </p>
            <Form criteria={criteria} onChange={setCriteria} />
            <ValidationMessage
                visible={showErrors && !!problem}
                message={problem ?? ""}
            />
            <Stack direction="row" gap="10px" wrap>
                <Button type="primary" onClick={save} disabled={isSaving}>
                    {existing ? "Save changes" : "Create alert"}
                </Button>
                <Button type="secondary" onClick={onCancel} disabled={isSaving}>
                    Cancel
                </Button>
            </Stack>
        </Stack>
    )
}

export default RuleEditor
