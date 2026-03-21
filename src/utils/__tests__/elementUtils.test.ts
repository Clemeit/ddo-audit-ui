import React from "react"
import { getElementInnerText } from "../elementUtils"

describe("elementUtils", () => {
    describe("getElementInnerText", () => {
        it("returns string directly for string input", () => {
            expect(getElementInnerText("hello")).toBe("hello")
        })

        it("returns empty string for non-element non-string", () => {
            expect(getElementInnerText(42 as any)).toBe("")
            expect(getElementInnerText(null as any)).toBe("")
            expect(getElementInnerText(undefined as any)).toBe("")
        })

        it("extracts text from React element children", () => {
            const element = React.createElement("span", null, "inner text")
            expect(getElementInnerText(element)).toBe("inner text")
        })

        it("handles nested React elements", () => {
            const element = React.createElement(
                "div",
                null,
                React.createElement("span", null, "hello"),
                " ",
                React.createElement("span", null, "world")
            )
            expect(getElementInnerText(element)).toContain("hello")
            expect(getElementInnerText(element)).toContain("world")
        })

        it("handles arrays of elements", () => {
            const elements = ["hello", " ", "world"]
            const result = getElementInnerText(elements as any)
            expect(result).toContain("hello")
            expect(result).toContain("world")
        })
    })
})
