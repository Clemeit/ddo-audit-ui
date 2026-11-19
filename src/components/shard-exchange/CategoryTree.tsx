import { useEffect, useState } from "react"
import { ShardExchangeCategory } from "../../models/ShardExchange.ts"
import { categoryTrail } from "../../utils/shardExchangeUtils.ts"
import Skeleton from "../global/Skeleton.tsx"

interface Props {
    categories: ShardExchangeCategory[]
    total?: number
    selected: string | null
    onSelect: (slug: string | null) => void
    isLoading?: boolean
}

const CategoryTree = ({
    categories,
    total,
    selected,
    onSelect,
    isLoading = false,
}: Props) => {
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

    // Keep the selected category's parents open (also after back/forward navigation)
    useEffect(() => {
        const trail = categoryTrail(categories, selected)
        if (trail.length < 2) return
        setExpanded((prev) => {
            const next = new Set(prev)
            trail.slice(0, -1).forEach((c) => next.add(c.slug))
            return next.size === prev.size ? prev : next
        })
    }, [categories, selected])

    const toggle = (slug: string) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(slug)) next.delete(slug)
            else next.add(slug)
            return next
        })
    }

    const renderCount = (count?: number) =>
        count == null ? null : (
            <span className="sx-category-count">{count.toLocaleString()}</span>
        )

    const renderCategory = (category: ShardExchangeCategory, depth: number) => {
        const hasChildren = category.children.length > 0
        const isOpen = expanded.has(category.slug)
        const isSelected = selected === category.slug
        const isEmpty = category.count === 0
        return (
            <li key={category.slug}>
                <div
                    className={`sx-category-row${isSelected ? " selected" : ""}${isEmpty ? " empty" : ""}`}
                    style={{ paddingLeft: `${depth * 14}px` }}
                >
                    {hasChildren ? (
                        <button
                            type="button"
                            className="sx-category-toggle"
                            aria-expanded={isOpen}
                            aria-label={`${isOpen ? "Collapse" : "Expand"} ${category.name}`}
                            onClick={() => toggle(category.slug)}
                        >
                            {isOpen ? "▾" : "▸"}
                        </button>
                    ) : (
                        <span className="sx-category-toggle-spacer" />
                    )}
                    <button
                        type="button"
                        className="sx-category-name"
                        aria-current={isSelected ? "true" : undefined}
                        onClick={() => {
                            onSelect(category.slug)
                            if (hasChildren && !isOpen) toggle(category.slug)
                        }}
                    >
                        {category.name}
                    </button>
                    {renderCount(category.count)}
                </div>
                {hasChildren && isOpen && (
                    <ul>
                        {category.children.map((child) =>
                            renderCategory(child, depth + 1)
                        )}
                    </ul>
                )}
            </li>
        )
    }

    if (isLoading && categories.length === 0) {
        return (
            <div className="sx-category-tree">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} height="22px" variant="text" />
                ))}
            </div>
        )
    }

    return (
        <nav className="sx-category-tree" aria-label="Item categories">
            <ul>
                <li>
                    <div
                        className={`sx-category-row${selected === null ? " selected" : ""}`}
                    >
                        <span className="sx-category-toggle-spacer" />
                        <button
                            type="button"
                            className="sx-category-name"
                            aria-current={
                                selected === null ? "true" : undefined
                            }
                            onClick={() => onSelect(null)}
                        >
                            All items
                        </button>
                        {renderCount(total)}
                    </div>
                </li>
                {categories.map((category) => renderCategory(category, 0))}
            </ul>
        </nav>
    )
}

export default CategoryTree
