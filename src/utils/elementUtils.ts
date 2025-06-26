import React from "react";

function getElementInnerText(element: React.ReactNode): string {
    console.log("getElementInnerText", element);
    if (typeof element === 'string') {
        return element;
    }
    if (React.isValidElement(element) && element.props.children) {
        const children = React.Children.toArray(element.props.children);
        return children
            .map(child => getElementInnerText(child))
            .join(' ').trim();
    }
    if (Array.isArray(element)) {
        return element.map(getElementInnerText).join(' ').trim();
    }
    return '';
}

export {
    getElementInnerText,
}