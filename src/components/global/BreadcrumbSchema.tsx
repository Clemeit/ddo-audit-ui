import React from "react"
import { useLocation } from "react-router-dom"

interface BreadcrumbItem {
    name: string
    url: string
}

const BreadcrumbSchema = () => {
    const location = useLocation()

    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        const pathSegments = location.pathname.split("/").filter(Boolean)
        const breadcrumbs: BreadcrumbItem[] = [
            { name: "Home", url: "https://www.ddoaudit.com/" },
        ]

        let currentPath = ""
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`
            const name = segment.charAt(0).toUpperCase() + segment.slice(1)
            breadcrumbs.push({
                name,
                url: `https://www.ddoaudit.com${currentPath}`,
            })
        })

        return breadcrumbs
    }

    const breadcrumbs = generateBreadcrumbs()

    if (breadcrumbs.length <= 1) return null

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((breadcrumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: breadcrumb.name,
            item: breadcrumb.url,
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData),
            }}
        />
    )
}

export default BreadcrumbSchema
