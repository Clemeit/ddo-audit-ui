interface Verification {
    challenge_word: string
    is_online: boolean
    is_anonymous: boolean
    challenge_word_match: boolean
    challenge_passed: boolean
    access_token: string
}

interface AccessToken {
    character_id: number
    access_token: string
}

export type { Verification, AccessToken }
