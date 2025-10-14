import React from "react"
import Stack from "../components/global/Stack.tsx"
import { CLASS_LIST_LOWER } from "../constants/game.ts"
import { Character } from "../models/Character.ts"
import { mapClassToIconBoundingBox } from "./socialUtils.ts"
import { FONTS, WHO_COLORS } from "../constants/whoPanel.ts"

// Renders a horizontal stack of class icons for a character
// Mirrors previous implementation from Timers.tsx
export function characterClassIconContainer(
    character: Character,
    spriteImage?: HTMLImageElement | null
): JSX.Element | null {
    const fonts = FONTS()
    if (!character.classes) return null
    return (
        <div style={{ display: "inline-block" }}>
            <Stack direction="row" gap="2px">
                {character.classes
                    ?.filter((classData) =>
                        CLASS_LIST_LOWER.includes(classData.name.toLowerCase())
                    )
                    ?.sort((a, b) => b.level - a.level)
                    ?.map((classData) => {
                        const spriteInfo = mapClassToIconBoundingBox(
                            classData.name
                        )
                        if (!spriteInfo || !spriteImage) return null

                        const canvas = document.createElement("canvas")
                        canvas.width = spriteInfo.width
                        canvas.height = spriteInfo.height
                        const context = canvas.getContext("2d", {
                            willReadFrequently: true,
                        })
                        if (!context) return null

                        context.imageSmoothingEnabled = false

                        // Draw the sprite section to the canvas
                        context.drawImage(
                            spriteImage,
                            spriteInfo.x,
                            spriteInfo.y,
                            spriteInfo.width,
                            spriteInfo.height,
                            0,
                            0,
                            spriteInfo.width,
                            spriteInfo.height
                        )
                        // shadow under text
                        context.save()
                        context.shadowColor = "rgba(0, 0, 0, 0.9)" // Darker, more opaque shadow
                        context.shadowBlur = 4 // Even more prominent shadow
                        context.shadowOffsetX = 2 // Slight horizontal offset
                        context.shadowOffsetY = 2 // Slight vertical offset
                        context.textAlign = "right"
                        context.textBaseline = "bottom"
                        context.fillStyle = WHO_COLORS.WHITE_TEXT
                        context.font = fonts.MEMBER_CLASS_LEVEL
                        context.fillText(
                            classData.level.toString(),
                            spriteInfo.width - 1,
                            spriteInfo.height - 1
                        )

                        context.restore()
                        const dataUrl = canvas.toDataURL()
                        return (
                            <img
                                key={`${character.id}-${classData.name}`}
                                src={dataUrl}
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    imageRendering: "pixelated",
                                }}
                                title={classData.name}
                                alt={classData.name}
                            />
                        )
                    })}
            </Stack>
        </div>
    )
}
