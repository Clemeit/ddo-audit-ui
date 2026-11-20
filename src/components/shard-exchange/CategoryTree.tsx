import { useEffect, useState } from "react"
import { ShardExchangeCategory } from "../../models/ShardExchange.ts"
import { categoryTrail } from "../../utils/shardExchangeUtils.ts"

interface Props {
    categories: ShardExchangeCategory[]
    total?: number
    selected: string | null
    onSelect: (slug: string | null) => void
    isLoading?: boolean
}

const countTitle = (name: string, count?: number) =>
    count == null
        ? name
        : `${name}: ${count.toLocaleString()} listing${count === 1 ? "" : "s"}`

/**
 * The category list on the left of the window: ALL ITEMS, then each category, with a +/− box
 * on the ones that have subcategories. The selected category is green.
 */
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

    const renderCategory = (category: ShardExchangeCategory, depth: number) => {
        const hasChildren = category.children.length > 0
        const isOpen = expanded.has(category.slug)
        const isSelected = selected === category.slug
        const isEmpty = category.count === 0
        return (
            <li key={category.slug}>
                <div
                    className={`sxw-tree-row${isSelected ? " selected" : ""}${isEmpty ? " empty" : ""}`}
                    style={{ paddingLeft: `${depth * 10}px` }}
                >
                    {hasChildren ? (
                        <button
                            type="button"
                            className={`sxw-tree-toggle${isOpen ? " open" : ""}`}
                            aria-expanded={isOpen}
                            aria-label={`${isOpen ? "Collapse" : "Expand"} ${category.name}`}
                            onClick={() => toggle(category.slug)}
                        />
                    ) : (
                        depth === 0 && <span className="sxw-tree-spacer" />
                    )}
                    <button
                        type="button"
                        className="sxw-tree-name"
                        aria-current={isSelected ? "true" : undefined}
                        title={countTitle(category.name, category.count)}
                        onClick={() => {
                            onSelect(category.slug)
                            if (hasChildren && !isOpen) toggle(category.slug)
                        }}
                    >
                        {category.name}
                    </button>
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

    return (
        <nav
            className="sxw-tree"
            aria-label="Item categories"
            aria-busy={isLoading}
        >
            <ul>
                <li>
                    <div
                        className={`sxw-tree-row${selected === null ? " selected" : ""}`}
                    >
                        <button
                            type="button"
                            className="sxw-tree-name sxw-tree-all"
                            aria-current={
                                selected === null ? "true" : undefined
                            }
                            title={countTitle("All items", total)}
                            onClick={() => onSelect(null)}
                        >
                            ALL ITEMS
                        </button>
                    </div>
                </li>
                {isLoading && categories.length === 0 ? (
                    <li className="sxw-tree-loading">Loading…</li>
                ) : (
                    categories.map((category) => renderCategory(category, 0))
                )}
            </ul>
        </nav>
    )
}

export default CategoryTree
