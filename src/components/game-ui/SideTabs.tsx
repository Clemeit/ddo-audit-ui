import { KeyboardEvent, ReactNode, useRef } from "react"

export interface SideTab<T extends string> {
    id: T
    label: string
    icon: ReactNode
}

interface Props<T extends string> {
    tabs: SideTab<T>[]
    selected: T
    onSelect: (id: T) => void
    // The id of the panel the tabs control (for aria-controls)
    panelId: string
    label: string
}

/** Leather tabs down the left side of a window. Arrow keys move between them. */
function SideTabs<T extends string>({
    tabs,
    selected,
    onSelect,
    panelId,
    label,
}: Props<T>) {
    const refs = useRef<(HTMLButtonElement | null)[]>([])

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const index = tabs.findIndex((t) => t.id === selected)
        let next = index
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = index + 1
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = index - 1
        else if (e.key === "Home") next = 0
        else if (e.key === "End") next = tabs.length - 1
        else return
        e.preventDefault()
        next = (next + tabs.length) % tabs.length
        onSelect(tabs[next].id)
        refs.current[next]?.focus()
    }

    return (
        <div
            className="gw-tabs"
            role="tablist"
            aria-label={label}
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
        >
            {tabs.map((tab, i) => {
                const isSelected = tab.id === selected
                return (
                    <button
                        key={tab.id}
                        ref={(el) => {
                            refs.current[i] = el
                        }}
                        type="button"
                        role="tab"
                        id={`${panelId}-tab-${tab.id}`}
                        className="gw-tab"
                        aria-selected={isSelected}
                        aria-controls={panelId}
                        tabIndex={isSelected ? 0 : -1}
                        // The open tab does nothing when clicked again
                        onClick={() => {
                            if (!isSelected) onSelect(tab.id)
                        }}
                    >
                        <span>{tab.label}</span>
                        {tab.icon}
                    </button>
                )
            })}
        </div>
    )
}

export default SideTabs
