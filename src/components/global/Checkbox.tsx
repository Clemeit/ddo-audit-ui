import React, { useState } from "react"
import { v4 as uuid } from "uuid"
import "./Checkbox.css"

interface Props {
    children: React.ReactNode
    checked: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    key?: string
}

const Checkbox = ({
    children = null,
    checked = false,
    onChange = () => {},
    key = "",
}: Props) => {
    const [id] = useState(uuid())

    return (
        <label className="checkbox-label" htmlFor={id} key={key}>
            <input
                className="checkbox-input"
                type="checkbox"
                id={id}
                checked={checked}
                onChange={onChange}
            />
            {children}
        </label>
    )
}

export default Checkbox
