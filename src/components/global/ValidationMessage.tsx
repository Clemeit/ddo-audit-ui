import React from "react"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Warning } from "../../assets/svg/warning.svg"
import "./ValidationMessage.css"

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
        <div
            className="validation-message"
            style={{
                color: typeToColorMap[type],
            }}
        >
            {type === "error" && <X style={{ fill: "red" }} />}
            {type === "warning" && <Warning style={{ fill: "orange" }} />}
            <div style={{ color: "inherit" }}>{message}</div>
        </div>
    )
}

export default ValidationMessage
