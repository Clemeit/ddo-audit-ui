import {
    MultipleCharacterResponseModel,
    SingleCharacterResponseModel,
} from "../models/Character.ts"
import { getRequest } from "./apiHelper.ts"

const CHARACTER_ENDPOINT = "characters"

function getCharacterByNameAndServer(name: string, server: string) {
    return getRequest<SingleCharacterResponseModel>(
        `${CHARACTER_ENDPOINT}/${server}/${name}`
    )
}

function getCharacterByName(name: string) {
    return getRequest<MultipleCharacterResponseModel>(
        `${CHARACTER_ENDPOINT}/any/${name}`
    )
}

function getCharacterById(id: string) {
    return getRequest<SingleCharacterResponseModel>(
        `${CHARACTER_ENDPOINT}/${id}`
    )
}

function getCharactersByIds(ids: number[]) {
    return getRequest<MultipleCharacterResponseModel>(
        `${CHARACTER_ENDPOINT}/ids/${ids.join(",")}`
    )
}

export {
    getCharacterByNameAndServer,
    getCharacterById,
    getCharactersByIds,
    getCharacterByName,
}
