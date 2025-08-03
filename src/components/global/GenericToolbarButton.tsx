import React from "react"
import Button from "./Button"
import "./GenericToolbarButton.css"
import Stack from "./Stack"

interface Props {
    onClick: () => void
    icon: React.ReactNode
    label?: string
    badge?: React.ReactNode
    disabled?: boolean
    hideOnMobile?: boolean
    iconOnly?: boolean
}

const GenericToolbarButton = ({
    onClick,
    icon,
    label,
    badge,
    disabled = false,
    hideOnMobile = false,
    iconOnly = false,
}: Props) => {
    return (
        <Button
            className={`generic-toolbar-button ${hideOnMobile ? "hide-on-mobile" : ""}`}
            onClick={onClick}
            disabled={disabled}
            data-attribute={`toolbar-button-${(label ?? "no-label").toLowerCase()}`}
        >
            <Stack direction="row" align="center" gap="8px">
                {icon}
                {!iconOnly && label && <span className="label">{label}</span>}
                {!iconOnly && badge && <span className="badge">{badge}</span>}
            </Stack>
        </Button>
    )
}

export default GenericToolbarButton
