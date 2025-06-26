import React, { useState } from "react"
import { v4 as uuid } from "uuid"
import logMessage from "../../utils/logUtils.ts"
import { getElementInnerText } from "../../utils/elementUtils.ts"

interface Props {
    children?: React.ReactNode
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    checked: boolean
    key?: string
}

const RadioButton = ({ children = null, onChange, checked, key }: Props) => {
    const [id] = useState(uuid())

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e)
        logMessage("Radio button changed", "info", {
            action: "change",
            component: "RadioButton",
            metadata: {
                label: getElementInnerText(children) || "None",
                checked: e.target.checked,
                id: e.target.id,
            },
        })
    }

    return (
        <label className="input-label" htmlFor={id} key={key}>
            <input
                type="radio"
                className="input-radio"
                id={id}
                name="radio-group"
                onChange={handleChange}
                checked={checked}
            />
            {children}
        </label>
    )
}

export default RadioButton
