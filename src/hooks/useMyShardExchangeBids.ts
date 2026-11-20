import { useCallback, useEffect, useMemo } from "react"
import useGetRegisteredCharacters from "./useGetRegisteredCharacters.ts"
import useAbortableRequest from "./useAbortableRequest.ts"
import { getMyBids } from "../services/shardExchangeService.ts"
import { LoadingState } from "../models/Api.ts"
import { MAX_REGISTERED_CHARACTERS } from "../constants/client.ts"
import { ShardExchangeMyBid } from "../models/ShardExchange.ts"

const REFRESH_MS = 5 * 60 * 1000
const EMPTY: ShardExchangeMyBid[] = []

export interface MyShardExchangeBids {
    hasVerified: boolean
    bids: ShardExchangeMyBid[]
    byRef: Map<string, ShardExchangeMyBid>
    characterName: (id: number) => string
    updatedAt: string | null
    state: LoadingState
    reload: () => void
}

export default function useMyShardExchangeBids(): MyShardExchangeBids {
    const { verifiedCharacters, accessTokens } = useGetRegisteredCharacters()

    const tokens = useMemo(() => {
        const byCharacter = new Map(
            accessTokens.map((t) => [t.character_id, t.access_token])
        )
        const unique = new Set<string>()
        for (const character of verifiedCharacters) {
            const token = byCharacter.get(character.id)
            if (token) unique.add(token)
            if (unique.size >= MAX_REGISTERED_CHARACTERS) break
        }
        return Array.from(unique).sort()
    }, [verifiedCharacters, accessTokens])

    const key = tokens.length ? `my-bids:${tokens.join(",")}` : null
    const { data, state, reload } = useAbortableRequest(key, (signal) =>
        getMyBids(tokens, signal)
    )

    useEffect(() => {
        if (key === null) return
        const id = window.setInterval(reload, REFRESH_MS)
        return () => window.clearInterval(id)
    }, [key, reload])

    const bids = key && data ? data.data : EMPTY
    const byRef = useMemo(
        () => new Map(bids.map((bid) => [bid.ref, bid])),
        [bids]
    )

    const names = useMemo(
        () => new Map(verifiedCharacters.map((c) => [c.id, c.name])),
        [verifiedCharacters]
    )
    const characterName = useCallback(
        (id: number) => names.get(id) || "Your character",
        [names]
    )

    return {
        hasVerified: tokens.length > 0,
        bids,
        byRef,
        characterName,
        updatedAt: (key && data?.updated_at) || null,
        state,
        reload,
    }
}
