import React, { useState } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import Spacer from "../global/Spacer.tsx"
import Button from "../global/Button.tsx"

const Page1 = ({ setPage }: { setPage: Function }) => {
    const [rules, setRules] = useState([])

    return (
        <>
            <ContentCluster title="Notification Rules">
                {rules.length === 0 && (
                    <div>You currently have no notification rules set up.</div>
                )}
                <Spacer size="20px" />
                <Stack gap="10px" fullWidth justify="space-between">
                    <div />
                    <Button type="primary" onClick={() => setPage(2)}>
                        New Rule
                    </Button>
                </Stack>
            </ContentCluster>
        </>
    )
}

export default Page1
