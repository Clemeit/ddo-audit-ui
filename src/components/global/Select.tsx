import React, { forwardRef, useCallback } from "react"
import logMessage from "../../utils/logUtils.ts"
import { getElementInnerText } from "../../utils/elementUtils.ts"

interface BaseProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    id: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    logEvents?: boolean
    logComponentName?: string
    loggingMetadata?: Record<string, any>
}

const Select = forwardRef<HTMLSelectElement, BaseProps>(
    (
        {
            id,
            value,
            onChange,
            children,
            logEvents = true,
            logComponentName = "Select",
            loggingMetadata,
            ...rest
        },
        ref
    ) => {
        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLSelectElement>) => {
                let thrown: unknown = undefined
                try {
                    onChange(e)
                } catch (err) {
                    thrown = err
                } finally {
                    if (logEvents) {
                        const selectEl = e.target
                        const selectedOption = selectEl.selectedOptions?.[0]
                        const selectedLabel =
                            selectedOption?.label ||
                            selectedOption?.text ||
                            getElementInnerText(children) ||
                            "None"

                        logMessage("Select changed", "info", {
                            action: "change",
                            component: logComponentName,
                            metadata: {
                                label: selectedLabel,
                                value: selectEl.value,
                                id: selectEl.id,
                                name: selectEl.name,
                                ...loggingMetadata,
                            },
                        })
                    }
                }
                if (thrown) {
                    throw thrown
                }
            },
            [onChange, logEvents, logComponentName, children]
        )

        return (
            <select
                id={id}
                ref={ref}
                value={value}
                onChange={handleChange}
                {...rest}
            >
                {children}
            </select>
        )
    }
)

Select.displayName = "Select"

export default Select
