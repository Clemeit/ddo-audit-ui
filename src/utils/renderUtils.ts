interface Props {
    sprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

interface SimpleBox {
    x: number
    y: number
    width: number
    height: number
}

interface RenderHeaderProps {
    boundingBox: SimpleBox
    text: string
    font: string
    left: SimpleBox
    center: SimpleBox
    right: SimpleBox
    textOffsetX?: number
    textOffsetY?: number
}

interface RenderBoxProps {
    boundingBox: SimpleBox
    topLeft: SimpleBox
    topRight: SimpleBox
    bottomLeft: SimpleBox
    bottomRight: SimpleBox
    top: SimpleBox
    right: SimpleBox
    bottom: SimpleBox
    left: SimpleBox
}

const useRenderBox = ({ sprite, context }: Props) => {
    const renderHeader = ({
        boundingBox,
        text,
        font,
        left,
        center,
        right,
        textOffsetX = 0,
        textOffsetY = 0,
    }: RenderHeaderProps) => {
        if (!sprite || !context) return

        context.drawImage(
            sprite,
            left.x,
            left.y,
            left.width,
            left.height,
            boundingBox.x,
            boundingBox.y,
            left.width,
            left.height
        )
        for (
            let i = 0;
            i <= Math.round(boundingBox.width / center.width);
            i++
        ) {
            context.drawImage(
                sprite,
                center.x,
                center.y,
                center.width,
                center.height,
                boundingBox.x + left.width + center.width * i,
                boundingBox.y,
                center.width,
                center.height
            )
        }
        context.drawImage(
            sprite,
            right.x,
            right.y,
            right.width,
            right.height,
            boundingBox.x + boundingBox.width - right.width,
            boundingBox.y,
            right.width,
            right.height
        )
        if (text) {
            context.fillStyle = "white"
            context.font = font
            context.textBaseline = "middle"
            context.textAlign = "center"
            context.fillText(
                text,
                boundingBox.x + boundingBox.width / 2 + textOffsetX,
                boundingBox.y + center.height / 2 + textOffsetY
            )
        }
    }

    const renderSortHeader = ({
        boundingBox,
        text,
        font,
        left,
        center,
        right,
        textOffsetX = 0,
        textOffsetY = 0,
    }: RenderHeaderProps) => {
        if (!sprite || !context) return

        context.drawImage(
            sprite,
            center.x,
            center.y,
            center.width,
            center.height,
            boundingBox.x,
            boundingBox.y,
            boundingBox.width,
            boundingBox.height
        )
        context.drawImage(
            sprite,
            left.x,
            left.y,
            left.width,
            left.height,
            boundingBox.x,
            boundingBox.y,
            left.width,
            left.height
        )
        context.drawImage(
            sprite,
            right.x,
            right.y,
            right.width,
            right.height,
            boundingBox.x + boundingBox.width - right.width,
            boundingBox.y,
            right.width,
            right.height
        )
        if (text) {
            context.fillStyle = "white"
            context.font = font
            context.textBaseline = "middle"
            context.textAlign = "left"
            context.fillText(
                text,
                boundingBox.x + textOffsetX,
                boundingBox.y + center.height / 2 + textOffsetY
            )
        }
    }

    const renderBox = ({
        boundingBox,
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
        top,
        right,
        bottom,
        left,
    }: RenderBoxProps) => {
        if (!sprite || !context) return

        context.translate(boundingBox.x, boundingBox.y)

        for (let i = 0; i < boundingBox.width / top.width; i++) {
            context.drawImage(
                sprite,
                top.x,
                top.y,
                top.width,
                top.height,
                Math.min(i * top.width, boundingBox.width - top.width),
                0,
                top.width,
                top.height
            )
            context.drawImage(
                sprite,
                bottom.x,
                bottom.y,
                bottom.width,
                bottom.height,
                Math.min(i * bottom.width, boundingBox.width - bottom.width),
                boundingBox.height - bottom.height,
                bottom.width,
                bottom.height
            )
        }
        for (let i = 0; i < boundingBox.height / left.height; i++) {
            context.drawImage(
                sprite,
                left.x,
                left.y,
                left.width,
                left.height,
                0,
                Math.min(i * left.height, boundingBox.height - left.height),
                left.width,
                left.height
            )
            context.drawImage(
                sprite,
                right.x,
                right.y,
                right.width,
                right.height,
                boundingBox.width - right.width,
                Math.min(i * right.height, boundingBox.height - right.height),
                right.width,
                right.height
            )
        }
        context.drawImage(
            sprite,
            topLeft.x,
            topLeft.y,
            topLeft.width,
            topLeft.height,
            0,
            0,
            topLeft.width,
            topLeft.height
        )
        context.drawImage(
            sprite,
            topRight.x,
            topRight.y,
            topRight.width,
            topRight.height,
            boundingBox.width - topRight.width,
            0,
            topRight.width,
            topRight.height
        )
        context.drawImage(
            sprite,
            bottomLeft.x,
            bottomLeft.y,
            bottomLeft.width,
            bottomLeft.height,
            0,
            boundingBox.height - bottomLeft.height,
            bottomLeft.width,
            bottomLeft.height
        )
        context.drawImage(
            sprite,
            bottomRight.x,
            bottomRight.y,
            bottomRight.width,
            bottomRight.height,
            boundingBox.width - bottomRight.width,
            boundingBox.height - bottomRight.height,
            bottomRight.width,
            bottomRight.height
        )

        context.resetTransform()
    }

    return { renderBox, renderHeader, renderSortHeader }
}

export default useRenderBox
