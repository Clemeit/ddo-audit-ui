import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react"
import { ShardIcon } from "./GameIcons.tsx"
import { formatShards } from "../../utils/shardExchangeUtils.ts"

// Red button; grey when disabled or `grey` (the game greys out what you can't use)
export const GameButton = ({
    grey = false,
    small = false,
    className,
    type = "button",
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    grey?: boolean
    small?: boolean
}) => (
    <button
        type={type}
        className={`gw-button${grey ? " grey" : ""}${small ? " small" : ""}${className ? ` ${className}` : ""}`}
        {...props}
    />
)

export const GameCheckbox = ({
    children,
    className,
    ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    children: ReactNode
}) => (
    <label className={`gw-check${className ? ` ${className}` : ""}`}>
        <input type="checkbox" {...props} />
        <span>{children}</span>
    </label>
)

// "1,354 ◆": an amount of shards with the crystal after it
export const ShardAmount = ({
    value,
    className,
    title,
}: {
    value: number | null | undefined
    className?: string
    title?: string
}) => (
    <span
        className={`gw-shard-amount${className ? ` ${className}` : ""}`}
        title={title}
    >
        {formatShards(value)}
        <ShardIcon size={13} />
        <span className="gw-visually-hidden"> shards</span>
    </span>
)
