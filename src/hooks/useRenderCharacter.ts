import React from "react"
import { Character } from "../models/Character.ts"

interface Props {
    character: Character
}

/**
 * Height: 42
 * Total width: 747
 * flexible width: 727
 * status width: 20
 * name width: 261
 * class width: 132
 * level width: 76
 * guild width: 258
 *
 * status percent: N/A (fixed width 20px)
 * name percent: 35%
 * class percent: 18%
 * level percent: 12%
 * guild percent: 35%
 */

const useRenderCharacter = ({ character }: Props) => {
    const renderCharacter = () => {}

    return renderCharacter()
}

export default useRenderCharacter
