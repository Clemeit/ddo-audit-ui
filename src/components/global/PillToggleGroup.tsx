import React from "react"
import "./PillToggleGroup.css"

interface Option<T extends string> {
    value: T
    label?: string
}

interface MultiProps<T extends string> {
    options: Option<T>[]
    selected: T[]
    onChange: (selected: T[]) => void
    // Adds a leading pill (e.g. "Any server") that is on when nothing is selected and clears the selection.
    anyLabel?: string
    ariaLabel: string
}

/** Pill buttons for picking several options; with `anyLabel`, picking none means "any". */
function PillToggleGroup<T extends string>({
    options,
    selected,
    onChange,
    anyLabel,
    ariaLabel,
}: MultiProps<T>) {
    const toggle = (value: T) =>
        onChange(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value]
        )

    return (
        <div className="pill-group" role="group" aria-label={ariaLabel}>
            {anyLabel && (
                <button
                    type="button"
                    className="pill"
                    aria-pressed={selected.length === 0}
                    onClick={() => onChange([])}
                >
                    {anyLabel}
                </button>
            )}
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className="pill"
                    aria-pressed={selected.includes(option.value)}
                    onClick={() => toggle(option.value)}
                >
                    {option.label ?? option.value}
                </button>
            ))}
        </div>
    )
}

interface SingleProps<T extends string> {
    options: Option<T>[]
    value: T
    onChange: (value: T) => void
    ariaLabel: string
}

/** The same pills, picking exactly one option. */
function PillRadioGroup<T extends string>({
    options,
    value,
    onChange,
    ariaLabel,
}: SingleProps<T>) {
    return (
        <div className="pill-group" role="radiogroup" aria-label={ariaLabel}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    className="pill"
                    aria-checked={value === option.value}
                    onClick={() => onChange(option.value)}
                >
                    {option.label ?? option.value}
                </button>
            ))}
        </div>
    )
}

export default PillToggleGroup
export { PillRadioGroup }
