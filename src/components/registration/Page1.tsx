import React, { useEffect, useState } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import RegistrationTable from "./RegistrationTable.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import "./Registration.css"
import { Character } from "../../models/Character.ts"
import Spacer from "../global/Spacer.tsx"
import {
    getAccessTokens,
    removeRegisteredCharacter,
    removeAccessToken,
} from "../../utils/localStorage.ts"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import ValidationMessage from "../global/ValidationMessage.tsx"

const Page1 = ({ setPage }: { setPage: Function }) => {
    const {
        registeredCharacters,
        accessTokens,
        isLoaded,
        isError,
        reload: reloadCharacters,
        unregisterCharacter,
    } = useGetRegisteredCharacters()

    return (
        <>
            <ContentCluster
                title="Registered Characters"
                subtitle="Register your characters to automatically filter LFMs and see your raid timers."
            >
                <RegistrationTable
                    characters={registeredCharacters}
                    accessTokens={accessTokens}
                    noCharactersMessage="No characters added"
                    unregisterCharacter={unregisterCharacter}
                />
                <ValidationMessage
                    type="error"
                    message="Failed to load characters. Showing cached data."
                    visible={isError}
                />
                <Spacer size="20px" />
                <Stack gap="10px" fullWidth justify="space-between">
                    <div />
                    <Button
                        text="Add a character"
                        type="primary"
                        onClick={() => setPage(2)}
                    />
                </Stack>
            </ContentCluster>
        </>
    )
}

export default Page1
