import React from "react"
import "./Switch.css"

interface Props {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
    // Required: the switch has no visible text of its own.
    label: string
    className?: string
}

/** An on/off toggle (a button with role="switch"). */
const Switch = ({
    checked,
    onChange,
    disabled = false,
    label,
    className = "",
}: Props) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        title={label}
        disabled={disabled}
        className={`switch ${checked ? "switch-on" : ""} ${className}`}
        onClick={() => onChange(!checked)}
    >
        <span className="switch-thumb" />
    </button>
)

export default Switch
