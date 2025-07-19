import "./Skeleton.css"

interface SkeletonProps {
    width?: string
    height?: string
    className?: string
    variant?: "text" | "rectangular" | "circular"
}

const Skeleton = ({
    width = "100%",
    height = "1em",
    className = "",
    variant = "text",
}: SkeletonProps) => {
    const baseClasses = `skeleton skeleton--${variant}`
    const allClasses = className ? `${baseClasses} ${className}` : baseClasses

    return (
        <div
            className={allClasses}
            style={{ width, height }}
            aria-label="Loading..."
        />
    )
}

export default Skeleton
