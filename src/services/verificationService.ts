import { VerificationResponse } from "../models/Verification"
import { getRequest } from "./apiHelper"

const VERIFICATION_ENDPOINT = "verification"

function getVerificationChallengeByCharacterId(character_id: number) {
    return getRequest<VerificationResponse>(
        `${VERIFICATION_ENDPOINT}/${character_id}`
    )
}

export { getVerificationChallengeByCharacterId }
