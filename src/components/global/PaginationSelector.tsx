import React, { useCallback, useEffect, useMemo, useState } from "react"
import Button from "./Button"

export type PaginationSelectorProps = {
    totalPages: number
    currentPage?: number // Controlled mode: when provided, component reflects this value
    defaultPage?: number // Uncontrolled initial page (ignored if currentPage is provided)
    onChange?: (page: number) => void
    disabled?: boolean
    showFirstLast?: boolean
    className?: string
    ariaLabel?: string
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

const PaginationSelector: React.FC<PaginationSelectorProps> = ({
    totalPages,
    currentPage,
    defaultPage = 1,
    onChange,
    disabled = false,
    showFirstLast = true,
    className,
    ariaLabel = "Pagination",
}) => {
    const isControlled = typeof currentPage === "number"
    const [internalPage, setInternalPage] = useState(() =>
        clamp(defaultPage, 1, Math.max(1, totalPages))
    )
    const page = clamp(
        isControlled ? (currentPage as number) : internalPage,
        1,
        Math.max(1, totalPages)
    )

    useEffect(() => {
        if (!isControlled) {
            setInternalPage((p) => clamp(p, 1, Math.max(1, totalPages)))
        }
    }, [isControlled, totalPages])

    const setPage = useCallback(
        (next: number) => {
            const clamped = clamp(next, 1, Math.max(1, totalPages))
            if (!isControlled) setInternalPage(clamped)
            if (onChange) onChange(clamped)
        },
        [isControlled, onChange, totalPages]
    )

    const gotoFirst = useCallback(() => setPage(1), [setPage])
    const gotoPrev = useCallback(() => setPage(page - 1), [page, setPage])
    const gotoNext = useCallback(() => setPage(page + 1), [page, setPage])
    const gotoLast = useCallback(
        () => setPage(totalPages),
        [setPage, totalPages]
    )

    const pageOptions = useMemo(() => {
        const opts: number[] = []
        for (let i = 1; i <= Math.max(1, totalPages); i++) opts.push(i)
        return opts
    }, [totalPages])

    if (totalPages <= 0) return null

    const isAtStart = page <= 1
    const isAtEnd = page >= totalPages
    const allDisabled = disabled || totalPages <= 1

    return (
        <div
            className={className}
            role="navigation"
            aria-label={ariaLabel}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
            {showFirstLast && (
                <Button
                    onClick={gotoFirst}
                    disabled={allDisabled || isAtStart}
                    aria-label="First page"
                    small
                >
                    «
                </Button>
            )}
            <Button
                onClick={gotoPrev}
                disabled={allDisabled || isAtStart}
                aria-label="Previous page"
                small
            >
                ‹
            </Button>

            <label
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
                <span>Page</span>
                <select
                    value={page}
                    onChange={(e) => setPage(Number(e.target.value))}
                    disabled={allDisabled}
                    aria-label="Select page"
                >
                    {pageOptions.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
                <span>of {totalPages}</span>
            </label>

            <Button
                onClick={gotoNext}
                disabled={allDisabled || isAtEnd}
                aria-label="Next page"
                small
            >
                ›
            </Button>
            {showFirstLast && (
                <Button
                    onClick={gotoLast}
                    disabled={allDisabled || isAtEnd}
                    aria-label="Last page"
                    small
                >
                    »
                </Button>
            )}
        </div>
    )
}

export default PaginationSelector
