import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Warning } from "../../assets/svg/warning.svg"
import "./ValidationMessage.css"
import Stack from "./Stack.tsx"

interface Props {
    type?: "error" | "warning" | "info" | "success" | "default"
    message: string
    visible: boolean
    showIcon?: boolean
}

const typeToColorMap = {
    error: "#ff2222",
    warning: "orange",
    info: "#6666ff",
    success: "green",
    default: "var(--text)",
}

const ValidationMessage = ({
    type = "error",
    message = "Error",
    visible = false,
    showIcon = true,
}: Props) => {
    if (!visible) return null

    return (
        <div className="validation-message">
            <Stack direction="row" gap="5px">
                {showIcon && (
                    <div>
                        {type === "error" && (
                            <X className="icon" style={{ fill: "red" }} />
                        )}
                        {type === "warning" && (
                            <Warning
                                className="icon"
                                style={{ fill: "orange" }}
                            />
                        )}
                    </div>
                )}
                <span style={{ color: typeToColorMap[type] }}>{message}</span>
            </Stack>
        </div>
    )
}

export default ValidationMessage
