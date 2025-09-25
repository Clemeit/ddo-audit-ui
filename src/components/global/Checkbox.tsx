import React, { useState } from "react"
import { v4 as uuid } from "uuid"
import logMessage from "../../utils/logUtils.ts"
import "./Checkbox.css"
import { getElementInnerText } from "../../utils/elementUtils.ts"

interface Props
    extends React.HTMLAttributes<HTMLInputElement | HTMLLabelElement> {
    children?: React.ReactNode
    checked?: boolean
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    disabled?: boolean
}

const Checkbox = ({
    children = null,
    checked = false,
    onChange = () => {},
    disabled = false,
    ...rest
}: Props) => {
    const [id] = useState(uuid())

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e)
        logMessage("Checkbox changed", "info", {
            action: "change",
            component: "Checkbox",
            metadata: {
                label: getElementInnerText(children) || "None",
                checked: e.target.checked,
                id: e.target.id,
            },
        })
    }

    return (
        <label className="checkbox-label" htmlFor={id} {...rest}>
            <input
                type="checkbox"
                className="checkbox-input"
                id={id}
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
            />
            {children}
        </label>
    )
}

export default Checkbox
