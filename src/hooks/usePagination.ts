import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const usePagination = ({ useQueryParams, clearOtherQueryParams } : { useQueryParams: boolean, clearOtherQueryParams: boolean } = { useQueryParams: false, clearOtherQueryParams: false }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = React.useState(1)

    useEffect(() => {
        const frame = new URLSearchParams(location.search).get("page")
        if (frame) {
            setCurrentPage(parseInt(frame))
        } else {
            setCurrentPage(1)
        }
    }, [location.search])

    const setPage = (frame: number) => {
        const searchParams = new URLSearchParams(location.search)
        if (clearOtherQueryParams) {
            // delete all other query params
            for (const key of searchParams.keys()) {
                if (key !== "page") {
                    searchParams.delete(key)
                }
            }
        }
        if (useQueryParams) {
            if (frame === 1) {
                searchParams.delete("page")
            } else {
                searchParams.set("page", frame.toString())
            }
            navigate(`${location.pathname}?${searchParams.toString()}`)
        } else {
            setCurrentPage(frame)
        }
    }

    return { currentPage, setPage }
}

export default usePagination
