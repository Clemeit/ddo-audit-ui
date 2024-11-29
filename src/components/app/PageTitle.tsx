import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import PropTypes from "prop-types"

const PageTitle = ({ title }) => {
    const location = useLocation()

    useEffect(() => {
        document.title = title
    }, [location, title])

    return null
}

PageTitle.propTypes = {
    title: PropTypes.string,
}

PageTitle.defaultProps = {
    title: "DDO Audit",
}

export default PageTitle
