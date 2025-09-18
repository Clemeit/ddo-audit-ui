import { useCallback, useMemo, useState } from "react"

export interface LegendFilterHighlightOptions {
    dataIds: string[]
    getColor: (id: string) => string
    dimAlpha?: number
}

export function useLegendFilterHighlight({
    dataIds,
    getColor,
    dimAlpha = 0.15,
}: LegendFilterHighlightOptions) {
    const [excluded, setExcluded] = useState<string[]>([])
    const [highlighted, setHighlighted] = useState<string | undefined>()

    const toggleExcluded = useCallback(
        (id: string) =>
            setExcluded((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            ),
        []
    )

    // const filteredData = useMemo(() => {
    //     if (!excluded.length) return data
    //     const excludedSet = new Set(excluded)
    //     return data.filter((s) => !excludedSet.has(s.id))
    // }, [data, excluded])

    const colorMap = useMemo(
        () => Object.fromEntries(dataIds.map((id) => [id, getColor(id)])),
        [dataIds, getColor]
    )

    const colorFn = useCallback(
        (id: string) => {
            const base = colorMap[id]
            if (!highlighted) return base
            if (id === highlighted) return base
            return base.replace("hsl", "hsla").replace(")", `, ${dimAlpha})`)
        },
        [colorMap, highlighted, dimAlpha]
    )

    return {
        excluded,
        highlighted,
        toggleExcluded,
        setHighlighted,
        // filteredData,
        colorFn,
        isExcluded: (id: string) => excluded.includes(id),
    }
}
