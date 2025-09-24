import { NewsItem } from "../../models/Service.ts"
import { dateToLongString } from "../../utils/dateUtils.ts"

interface Props {
    news?: NewsItem[]
}

const NewsCluster = ({ news }: Props) => {
    if (news == null) {
        return <p style={{ marginBottom: 0 }}>Loading...</p>
    }

    if (!news.length) {
        return <p style={{ marginBottom: 0 }}>There's nothing going on here!</p>
    }

    return (
        <div className="news-cluster" role="feed" aria-label="News updates">
            {news
                .sort(
                    (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((newsItem: NewsItem) => (
                    <article key={newsItem.id} className="news-item">
                        <time dateTime={newsItem.date}>
                            <strong>
                                {dateToLongString(new Date(newsItem.date))}:
                            </strong>
                        </time>{" "}
                        <span>
                            {newsItem.message || "No message available"}
                        </span>
                    </article>
                ))}
        </div>
    )
}

export default NewsCluster
