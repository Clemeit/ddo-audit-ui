import { NewsResponse, NewsItem } from "../../models/Service.ts"
import { dateToLongString } from "../../utils/dateUtils.ts"

interface Props {
    news?: NewsResponse
}

const NewsCluster = ({ news }: Props) => {
    if (news == null) {
        return <p>Loading...</p>
    }

    if (!news.data?.length) {
        return <p>No news available</p>
    }

    return (
        <div role="feed" aria-label="News updates">
            {news.data
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
