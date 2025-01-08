class BoundingBox {
    x: number = 0
    y: number = 0
    width: number = 0
    height: number = 0

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    top(): number {
        return this.y
    }
    left(): number {
        return this.x
    }
    right(): number {
        return this.x + this.width
    }
    bottom(): number {
        return this.y + this.height
    }
    centerX(): number {
        return this.x + this.width / 2
    }
    centerY(): number {
        return this.y + this.height / 2
    }
    translate(x: number, y: number): void {
        this.x += x
        this.y += y
    }
    pad(horizontal: number, vertical: number) {
        this.x += horizontal / 2
        this.y += vertical / 2
        this.width -= horizontal
        this.height -= vertical
    }
}

export { BoundingBox }
