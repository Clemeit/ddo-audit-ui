import { useState } from "react"
import { getBooleanFlag, setBooleanFlag } from "../utils/localStorage"

const useBooleanFlag = (key: string, defaultValue: boolean = false) => {
    const [value, setValue] = useState(
        () => getBooleanFlag(key) ?? defaultValue
    )

    const setFlag = (newValue: boolean) => {
        setBooleanFlag(key, newValue)
        setValue(newValue)
    }

    return [value, setFlag] as const
}

export default useBooleanFlag
