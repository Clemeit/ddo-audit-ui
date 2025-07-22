import React from "react"
import { LfmProvider } from "./LfmContext.tsx"
import { WhoProvider } from "./WhoContext.tsx"
import { AreaProvider } from "./AreaContext.tsx"
import { QuestProvider } from "./QuestContext.tsx"

interface Props {
    children: React.ReactNode
}

// Most common combination: LfmProvider > WhoProvider > AreaProvider
export const SocialDataProvider = ({ children }: Props) => (
    <LfmProvider>
        <WhoProvider>
            <AreaProvider>{children}</AreaProvider>
        </WhoProvider>
    </LfmProvider>
)

// Full grouping stack: LfmProvider > WhoProvider > AreaProvider > QuestProvider
export const GroupingDataProvider = ({ children }: Props) => (
    <LfmProvider>
        <WhoProvider>
            <AreaProvider>
                <QuestProvider>{children}</QuestProvider>
            </AreaProvider>
        </WhoProvider>
    </LfmProvider>
)

// Who-focused stack: WhoProvider > LfmProvider > AreaProvider
export const WhoDataProvider = ({ children }: Props) => (
    <WhoProvider>
        <LfmProvider>
            <AreaProvider>{children}</AreaProvider>
        </LfmProvider>
    </WhoProvider>
)

// Light registration stack: LfmProvider > WhoProvider > AreaProvider
export const RegistrationDataProvider = ({ children }: Props) => (
    <WhoProvider>
        <AreaProvider>{children}</AreaProvider>
    </WhoProvider>
)
