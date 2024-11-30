import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const usePagination = ({ useQueryParams, clearOtherQueryParams, maxPage } : { useQueryParams: boolean, clearOtherQueryParams: boolean, maxPage: number } = { useQueryParams: false, clearOtherQueryParams: false, maxPage: 99 }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = React.useState(1)

    useEffect(() => {
        const pageNumberParam = new URLSearchParams(location.search).get("page")
        if (pageNumberParam) {
            const pageNumber = parseInt(pageNumberParam)
            if (pageNumber > maxPage) {
                setCurrentPage(maxPage)
            } else {
                setCurrentPage(pageNumber)
            }
        } else {
            setCurrentPage(1)
        }
    }, [location.search])

    const setPage = (pageNumber: number) => {
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
            if (pageNumber === 1) {
                searchParams.delete("page")
            } else {
                searchParams.set("page", pageNumber.toString())
            }
            navigate(`${location.pathname}?${searchParams.toString()}`)
        } else {
            setCurrentPage(pageNumber)
        }
    }

    return { currentPage, setPage }
}

export default usePagination
