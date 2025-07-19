import Skeleton from "../global/Skeleton"

const QuickInfoSkeleton = () => {
    return (
        <ul>
            <li className="skeleton-list-item">
                <Skeleton width="180px" />
            </li>
            <li className="skeleton-list-item">
                <Skeleton width="240px" />
            </li>
            <li className="skeleton-list-item">
                <Skeleton width="360px" />
            </li>
        </ul>
    )
}

export default QuickInfoSkeleton
