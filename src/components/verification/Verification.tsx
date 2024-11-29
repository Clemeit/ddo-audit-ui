import React from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import Button from "../global/Button.tsx"
import Stack from "../global/Stack.tsx"
import "./Verification.css"
import { Link } from "react-router-dom"
import CharacterTable from "../global/CharacterTable.tsx"

const Verification = () => {
    const [frame, setFrame] = React.useState(1)

    const FAKE_CHARACTER_1: Character = {
        id: "1",
        name: "Clemeit-1",
        total_level: 30,
    }
    const FAKE_CHARACTER_2: Character = {
        id: "2",
        name: "Fayelin",
        total_level: 20,
    }
    const FAKE_CHARACTER_3: Character = {
        id: "3",
        name: "Sinetic",
        total_level: 10,
    }

    const FAKE_CHARACTERS = [
        FAKE_CHARACTER_1,
        FAKE_CHARACTER_2,
        FAKE_CHARACTER_3,
    ]

    const frame1 = (
        <>
            <ContentCluster title="Benefits">
                <p>
                    Verifying your character gives you access to additional
                    information like:
                </p>
                <ul>
                    <li>
                        Questing history - what quests you've ran, when you ran
                        them, and how long they took
                    </li>
                    <li>
                        Level history - when you level up and how long each
                        level took to complete
                    </li>
                    <li>
                        Login history - when you log in and log out, daily and
                        weekly playtime
                    </li>
                    <li>
                        Giuild members - information that you'd find in the
                        Guild tab of the social panel
                    </li>
                </ul>
                <p>
                    Character verification is entirely optional. This process is
                    easy and does not require login credentials or personal
                    information.{" "}
                    <span className="orange-text">
                        We will never ask for your username or password. Do not
                        provide this information to us!
                    </span>
                </p>
                <Stack gap="10px" fullWidth justify="space-between">
                    <Button text="Back" type="secondary" disabled />
                    <Button
                        text="Next"
                        type="primary"
                        onClick={() => setFrame(2)}
                    />
                </Stack>
            </ContentCluster>
        </>
    )

    const frame2 = (
        <>
            <ContentCluster title="Select a Character">
                <p>Select a registered character to verify:</p>
                <CharacterTable
                    characters={FAKE_CHARACTERS}
                    verifiedCharacters={["1"]}
                />
                <p>
                    Not seeing your characters? Go to{" "}
                    <Link style={{ color: "#2299FF" }} to="registration">
                        Character Registration
                    </Link>{" "}
                    to add them!
                </p>
                <Stack gap="10px" fullWidth justify="space-between">
                    <Button
                        text="Back"
                        type="secondary"
                        onClick={() => setFrame(1)}
                    />
                    <Button
                        text="Next"
                        type="primary"
                        onClick={() => setFrame(3)}
                    />
                </Stack>
            </ContentCluster>
        </>
    )

    const frame3 = (
        <>
            <ContentCluster title="Verify Character">
                <p>
                    To verify your character, you will need to log into the game
                    and enter the following text in the Public Comment field
                    found in the Social Panel.
                </p>
                <code className="verification-code">749ICH</code>
                <p>This page will automatically refresh.</p>
                <Stack gap="10px" fullWidth justify="space-between">
                    <Button
                        text="Back"
                        type="secondary"
                        onClick={() => setFrame(2)}
                    />
                    <Button
                        text="Next"
                        type="primary"
                        onClick={() => setFrame(4)}
                    />
                </Stack>
            </ContentCluster>
        </>
    )

    const frame4 = (
        <>
            <ContentCluster title="Verify Character">
                <p>
                    One last step. Remove the verification code from the Public
                    Comment field in the Social Panel.
                </p>
                <p>This page will automatically refresh.</p>
                <Stack gap="10px" fullWidth justify="space-between">
                    <Button
                        text="Back"
                        type="secondary"
                        onClick={() => setFrame(3)}
                    />
                </Stack>
            </ContentCluster>
        </>
    )

    return (
        <Page
            title="DDO Character Verification"
            description="Verify your characters to access detailed information such as questing history, level history, login history, and more."
        >
            {frame === 1 && frame1}
            {frame === 2 && frame2}
            {frame === 3 && frame3}
            {frame === 4 && frame4}
        </Page>
    )
}

export default Verification
