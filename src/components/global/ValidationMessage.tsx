import React from "react"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Warning } from "../../assets/svg/warning.svg"
import "./ValidationMessage.css"
import Stack from "./Stack.tsx"

interface Props {
    type?: "error" | "warning" | "info" | "success"
    message: string
    visible: boolean
}

const typeToColorMap = {
    error: "red",
    warning: "orange",
    info: "blue",
    success: "green",
}

const ValidationMessage = ({
    type = "error",
    message = "Error",
    visible = false,
}: Props) => {
    if (!visible) return null

    return (
        <div className="validation-message">
            <Stack direction="row" gap="5px">
                <div>
                    {type === "error" && (
                        <X className="icon" style={{ fill: "red" }} />
                    )}
                    {type === "warning" && (
                        <Warning className="icon" style={{ fill: "orange" }} />
                    )}
                </div>
                <div style={{ color: typeToColorMap[type] }}>{message}</div>
            </Stack>
        </div>
    )
}

export default ValidationMessage
