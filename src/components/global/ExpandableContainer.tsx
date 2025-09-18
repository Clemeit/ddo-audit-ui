import React, { useState } from "react"
import { ReactComponent as Expand } from "../../assets/svg/expand.svg"
import { ReactComponent as Contract } from "../../assets/svg/contract.svg"
import "./ExpandableContainer.css"
import Stack from "./Stack"

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    icon?: React.ReactNode
    children?: React.ReactNode
    defaultState?: boolean
    stateChangeCallback?: (isOpen: boolean) => void
    className?: string
}

const ExpandableContainer = ({
    title = "Expandable Container",
    icon,
    children,
    defaultState = false,
    stateChangeCallback = () => {},
    className = "",
    ...rest
}: Props) => {
    const [isOpen, setIsOpen] = useState(defaultState)

    React.useEffect(() => {
        stateChangeCallback?.(isOpen)
    }, [isOpen])

    return (
        <div
            className={`expandable-container ${className ? className : ""}`}
            {...rest}
        >
            <div
                className="expandable-container-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Stack direction="row" align="center" gap="5px">
                    {icon && icon}
                    {title}
                </Stack>
                {isOpen ? (
                    <Contract className="expandable-container-icon" />
                ) : (
                    <Expand className="expandable-container-icon" />
                )}
            </div>
            {isOpen && (
                <div>
                    <hr style={{ margin: "0px" }} />
                    <div className="expandable-container-content">
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ExpandableContainer
