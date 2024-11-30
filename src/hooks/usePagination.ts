import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const usePagination = () => {
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
        if (frame === 1) {
            searchParams.delete("page")
        } else {
            searchParams.set("page", frame.toString())
        }
        navigate(`${location.pathname}?${searchParams.toString()}`)
        setCurrentPage(frame)
    }

    return { currentPage, setPage }
}

export default usePagination
