// Original SVG icons for the game-styled UI. Simple shapes with metallic gradients; they are
// drawn here, not copied from the game.
import { SVGProps, useId } from "react"

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

// A small blue crystal: the currency mark next to every price
export const ShardIcon = ({ size = 16, ...props }: IconProps) => {
    const id = useId()
    return (
        <svg
            width={size}
            height={size * 1.25}
            viewBox="0 0 16 20"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <defs>
                <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#d9f0ff" />
                    <stop offset="0.35" stopColor="#5b8cff" />
                    <stop offset="1" stopColor="#1a2a9c" />
                </linearGradient>
                <linearGradient id={`${id}b`} x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3a5ad8" />
                    <stop offset="1" stopColor="#0d1460" />
                </linearGradient>
            </defs>
            <path
                d="M4 1 L13 6 L12 17 L3 12 Z"
                fill={`url(#${id}a)`}
                stroke="#0a0f3a"
                strokeWidth="1"
                strokeLinejoin="round"
            />
            <path d="M8.5 3.5 L13 6 L12 17 L8 9.5 Z" fill={`url(#${id}b)`} />
            <path d="M5 3 L7.5 4.4 L6.5 9 Z" fill="#ffffff" opacity="0.75" />
        </svg>
    )
}

// Silver metal gradient shared by the tab icons
const Metal = ({ id }: { id: string }) => (
    <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#c6c7c3" />
            <stop offset="0.52" stopColor="#7e7f7b" />
            <stop offset="0.74" stopColor="#dedfdb" />
            <stop offset="1" stopColor="#585955" />
        </linearGradient>
    </defs>
)

// Auction hammer: head, handle and a sounding block
export const GavelIcon = ({ size = 56, ...props }: IconProps) => {
    const id = useId()
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 56 56"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <Metal id={id} />
            <g stroke="#262626" strokeWidth="1.5" strokeLinejoin="round">
                {/* Round sounding block: side band, then its top face */}
                <path d="M6 45 V49 A14 4.5 0 0 0 34 49 V45" fill="#6d6e6a" />
                <ellipse
                    cx="20"
                    cy="45"
                    rx="14"
                    ry="4.5"
                    fill={`url(#${id})`}
                />
                {/* Handle, from the middle of the head down to the right */}
                <path
                    d="M25.5 21.5 L49 45 L45.5 48.5 L22 25 Z"
                    fill={`url(#${id})`}
                />
                <circle cx="47.5" cy="46.5" r="3" fill={`url(#${id})`} />
                {/* Barrel-shaped head across the handle, with banded ends */}
                <g transform="rotate(-45 22 21)">
                    <rect
                        x="6"
                        y="14"
                        width="32"
                        height="14"
                        rx="3"
                        fill={`url(#${id})`}
                    />
                    <rect
                        x="4"
                        y="12.5"
                        width="5"
                        height="17"
                        rx="1.5"
                        fill="#8c8d89"
                    />
                    <rect
                        x="35"
                        y="12.5"
                        width="5"
                        height="17"
                        rx="1.5"
                        fill="#8c8d89"
                    />
                    <path
                        d="M12 17 H32"
                        stroke="#ffffff"
                        strokeOpacity="0.55"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </g>
            </g>
        </svg>
    )
}

// Bidding paddle: a rounded blade with a slot and a short handle
export const PaddleIcon = ({ size = 56, ...props }: IconProps) => {
    const id = useId()
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 56 56"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <Metal id={id} />
            <g
                transform="rotate(35 28 28)"
                stroke="#262626"
                strokeWidth="1.5"
                strokeLinejoin="round"
            >
                <rect
                    x="25"
                    y="32"
                    width="6"
                    height="20"
                    rx="2.5"
                    fill={`url(#${id})`}
                />
                <rect
                    x="14"
                    y="4"
                    width="28"
                    height="30"
                    rx="7"
                    fill={`url(#${id})`}
                />
                <rect
                    x="24"
                    y="12"
                    width="8"
                    height="13"
                    rx="1.5"
                    fill="#2a2a2a"
                />
            </g>
        </svg>
    )
}

// Price tag with a hole for the string
export const TagIcon = ({ size = 56, ...props }: IconProps) => {
    const id = useId()
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 56 56"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <Metal id={id} />
            <path
                d="M6 8 L26 6 L50 30 L30 50 L6 26 Z"
                fill={`url(#${id})`}
                stroke="#262626"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <circle cx="15" cy="15" r="3.5" fill="#2a2a2a" stroke="#262626" />
            <path
                d="M22 30 L32 20 M26 34 L36 24"
                stroke="#6d6e6a"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    )
}

// Category glyphs for the item icon frame. Each is a 24×24 line drawing.
const CATEGORY_PATHS: Record<string, string> = {
    weapons:
        "M5 19 L15 9 M15 9 L19 5 L19 9 L15 9 L15 5 M4 16 L8 20 M6 18 L3 21",
    armor: "M6 4 L10 6 L14 6 L18 4 L21 8 L18 11 L18 20 L6 20 L6 11 L3 8 Z M10 6 L12 9 L14 6",
    shields:
        "M12 3 L20 6 L20 12 C20 17 16 20 12 21 C8 20 4 17 4 12 L4 6 Z M12 7 L12 17 M8 11 L16 11",
    clothing:
        "M8 3 L12 6 L16 3 L21 7 L18 11 L17 9 L17 21 L7 21 L7 9 L6 11 L3 7 Z",
    jewelry: "M12 9 A6 6 0 1 0 12.01 9 M9 4 L12 7 L15 4 L13 2 L11 2 Z",
    potions:
        "M10 3 L14 3 M10.5 3 L10.5 8 L6 15 C5 18 7 21 10 21 L14 21 C17 21 19 18 18 15 L13.5 8 L13.5 3 M7.5 14 L16.5 14",
    scrolls:
        "M7 4 L18 4 C20 4 20 7 18 7 L18 18 C18 21 15 21 15 18 L15 17 L4 17 L4 18 C4 21 7 21 7 21 L15 21 M7 4 C5 4 5 7 7 7 L7 17 M10 9 L15 9 M10 12 L15 12",
    wands: "M5 19 L16 8 M16 8 L18 6 M17 3 L17.6 5 L20 5 L18.2 6.4 L19 9 L17 7.5 L15 9 L15.8 6.4 L14 5 L16.4 5 Z",
    tomes: "M5 4 L17 4 L19 6 L19 21 L7 21 C5 21 5 18 7 18 L19 18 M5 4 L5 19 M9 8 L15 8",
    gems: "M7 4 L17 4 L21 9 L12 21 L3 9 Z M3 9 L21 9 M9 4 L7.5 9 L12 21 L16.5 9 L15 4",
    ingredients:
        "M12 21 L12 11 M12 11 C12 6 16 4 20 4 C20 9 17 11 12 11 M12 14 C12 10 9 8 5 8 C5 12 8 14 12 14",
    components:
        "M12 8 A4 4 0 1 0 12.01 8 M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5",
    "item-augments":
        "M12 3 L19 7 L19 17 L12 21 L5 17 L5 7 Z M12 8 L15 10 L15 14 L12 16 L9 14 L9 10 Z",
    collectables: "M7 8 L17 8 L19 20 L5 20 Z M9 8 C9 4 15 4 15 8 M8 12 L16 12",
    ammunition:
        "M4 20 L16 8 M16 8 L20 4 L19 9 Z M16 8 L15 3 Z M6 18 L4 16 M8 16 L6 14",
    runearms:
        "M5 18 L11 12 M11 12 L19 4 M13 4 L20 4 L20 11 M8 12 L12 16 M15 13 L18 16",
    tools: "M14 4 C17 3 20 6 19 9 L16 9 L15 8 L15 5 Z M15 8 L5 18 C4 19 5 20 6 19 L16 9",
    "creature-companions":
        "M8 9 A2 2.5 0 1 0 8.01 9 M16 9 A2 2.5 0 1 0 16.01 9 M5 13 A1.8 2.2 0 1 0 5.01 13 M19 13 A1.8 2.2 0 1 0 19.01 13 M12 13 C8 13 7 20 10 20 C11 20 12 19 12 19 C12 19 13 20 14 20 C17 20 16 13 12 13",
    miscellaneous:
        "M6 7 L18 7 L18 19 L6 19 Z M6 7 L9 4 L21 4 L18 7 M21 4 L21 16 L18 19",
}

// Picks a glyph from the listing's top-level category slug ("jewelry.rings" -> jewelry)
export function categoryGlyphKey(category: string | null | undefined): string {
    const top = (category ?? "").split(".")[0]
    if (top in CATEGORY_PATHS) return top
    const match = Object.keys(CATEGORY_PATHS).find(
        (key) =>
            top.startsWith(key.slice(0, 5)) || key.startsWith(top.slice(0, 5))
    )
    return match && top ? match : "miscellaneous"
}

export const CategoryGlyph = ({
    category,
    size = 26,
    ...props
}: IconProps & { category: string | null | undefined }) => {
    const id = useId()
    const path = CATEGORY_PATHS[categoryGlyphKey(category)]
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f6f1dc" />
                    <stop offset="1" stopColor="#a39b80" />
                </linearGradient>
            </defs>
            <path
                d={path}
                fill="none"
                stroke="#000"
                strokeOpacity="0.7"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d={path}
                fill="none"
                stroke={`url(#${id})`}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
