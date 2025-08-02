import React from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import {
    DonateButton,
    GitHubButton,
    MakeASuggestionButton,
} from "../buttons/Buttons.tsx"
import WebLink from "../global/WebLink.tsx"
import Stack from "../global/Stack.tsx"
import ColoredText from "../global/ColoredText.tsx"
import { AlphaReleasePageMessage } from "../global/CommonMessages.tsx"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import { getBuildTime, getCommitHash } from "../../utils/logUtils.ts"

const About = () => {
    const [hideAlphaRelease, setHideAlphaRelease] = useBooleanFlag(
        BOOLEAN_FLAGS.hideAlphaRelease
    )

    return (
        <Page
            title="About DDO Audit"
            description="Learn about the DDO Audit project! Read our mission statement, methodology, and contributing parties."
        >
            {!hideAlphaRelease && (
                <div className="alpha-release-message">
                    <AlphaReleasePageMessage
                        onDismiss={() => {
                            setHideAlphaRelease(true)
                        }}
                    />
                </div>
            )}
            <ContentClusterGroup>
                <ContentCluster title="Mission">
                    <p>
                        To provide the community with the most accurate and
                        up-to-date information on DDO's population; to foster
                        player interactions by hosting a Live LFM panel and Live
                        'Who' list; and to keep players informed of server
                        status, time zone trends, character demographics, and
                        more! We're not here to push an agenda or to point
                        fingers.{" "}
                        <ColoredText color="orange">
                            Our goal is, and has always been, to provide useful,
                            transparent, and unbiased information.
                        </ColoredText>
                    </p>
                </ContentCluster>
                <ContentCluster title="Methodology">
                    <p>
                        Data is collected from the game every few seconds. This
                        data contains information that is visible in the in-game
                        "Who" panel (character name, gender, race, etc.).{" "}
                        <ColoredText color="orange">
                            We do not collect, store, or publish personal
                            information.
                        </ColoredText>{" "}
                        We do, however, collect information on anonymous
                        characters. Anonymous characters <u>are</u> counted in
                        the population reports. Anonymous characters{" "}
                        <u>are not</u> counted in any demographic reports and
                        will never show up in our Who List. Our API includes
                        anonymous characters, but their data has been
                        anonymized.
                    </p>
                    <p>
                        The character data that we collect includes name,
                        gender, race, class, level, location, and guild name.
                        This information is used to generate the various
                        demographic reports on the website. Additionally,
                        character location data is recorded, analyzed, and used
                        to track quest popularity and raid timers.
                    </p>
                    <p>
                        When a character posts a public LFM, the data we collect
                        also includes public comment, quest selection,
                        difficulty selection, level range, accepted classes, and
                        the "adventure active" length. The group data is then
                        used to generate the LFM panel (that's not a screenshot
                        - it's being drawn in your browser).
                    </p>
                </ContentCluster>
                <ContentCluster title="Contributions">
                    <p>
                        A special thanks to the incredibly talented and generous
                        developers over at Dungeon Helper. Their support played
                        an integral role in the development of this project's
                        Live LFM Viewer and Who List. Visit their various
                        projects:{" "}
                        <WebLink href="https://vaultofkundarak.com/">
                            VoK Item Database
                        </WebLink>
                        ,{" "}
                        <WebLink href="https://dungeonhelper.com/">
                            DDO Plugin Framework
                        </WebLink>
                        , and{" "}
                        <WebLink href="https://trove.dungeonhelper.com/">
                            Automated Inventory Management
                        </WebLink>
                        , or stop by their{" "}
                        <WebLink href="https://discord.gg/bfMZnbz">
                            Discord server
                        </WebLink>{" "}
                        to stay up-to-date on their development.
                    </p>
                    <p>
                        And thank <strong>you</strong> for your continued
                        support.{" "}
                        <ColoredText color="orange">
                            This project simply would not exist without DDO's
                            incredible community.
                        </ColoredText>{" "}
                        Many of the features on this website were a direct
                        result of player feedback on the DDO Discord, Forums,
                        and Reddit, and your continued use inspires me to grow
                        and develop the DDO Audit project far beyond what I
                        could have ever imagined. I'm always looking for
                        feedback and suggestions!
                    </p>
                    <Stack gap="10px">
                        <MakeASuggestionButton />
                        <GitHubButton />
                    </Stack>
                </ContentCluster>
                <ContentCluster title="Donations">
                    <p>
                        DDO Audit has been, and will continue to remain,
                        completely free to use. If you find this tool to be
                        helpful and would like to support the project, you can
                        do so by donating to my PayPal. All donations go toward
                        server costs and future development. Thank you for your
                        support!
                    </p>
                    <DonateButton />
                </ContentCluster>
                <ContentCluster title="Development">
                    <p>
                        DDO Audit is the culmination of over five years of work.
                        My original vision for the project was nothing more than
                        a population reporting tool to help players choose a
                        server that's right for them. I knew little to nothing
                        about web development, server infrastructure, or
                        databases. I learned as I went, browsing forum posts,
                        watching YouTube tutorial videos, reading books, and
                        iterating on my designs.
                    </p>
                    <p>
                        The original website was written in HTML, JavaScript,
                        and CSS using the famous IDE known as Notepad (no joke -
                        I have like 20,000 lines of frontend work done using
                        Notepad). The data aggregation and interpretation work
                        was painfully done using C (other than for embedded
                        systems, I'm never using that language again), and the
                        data collection portion was written in Visual Basic
                        (using Visual Studio).
                    </p>
                    <p>
                        The second version of the website was a little less
                        haphazardly thrown together. It was written using JSX
                        and the React framework with Visual Studio Code. All of
                        the server infrastructure work was done using NodeJS.
                        Data aggregation and interpretation work was done using
                        JavaScript, and the data collection side was recreated
                        using C#.
                    </p>
                    <p>
                        The latest iteration of the project - and hopefully the
                        final iteration - has been an ongoing effort starting
                        back in early 2024. The backend was entirely rewritten
                        in Python with a Sanic webserver. Frequently fetched
                        data such as LFM and Character data is cached in a Redis
                        in-memory DB for super fast access. Persistant storage
                        is done using Postgres. The data collection layer was
                        rewritten - still using C# but this version if hopefully
                        a lot more robust. The entire project is containerized
                        using Docker. The backend source code is public, and you
                        can view it at{" "}
                        <WebLink href="https://github.com/Clemeit/ddo-audit-service">
                            Clemeit/ddo-audit-service
                        </WebLink>
                        . The frontend source code is over at{" "}
                        <WebLink href="https://github.com/Clemeit/ddo-audit-ui">
                            Clemeit/ddo-audit-ui
                        </WebLink>
                        .
                    </p>
                    <p>
                        DDO Audit has been a great learning opportunity, and I'm
                        sure I'll continue development well into the future.
                        Thanks for visiting!
                    </p>
                    <p>
                        See you in game,
                        <br />
                        <i>Clemeit of Thrane</i>
                    </p>
                </ContentCluster>
                <ContentCluster
                    title="Contact Information"
                    subtitle="Listed in order of preference."
                >
                    <ul>
                        <li>
                            <WebLink href="https://discord.com/users/313127244362940416">
                                Discord: Clemeit#7994
                            </WebLink>
                        </li>
                        <li>
                            <WebLink href="https://forums.ddo.com/index.php?members/clemeit.381">
                                DDO Forums: Clemeit
                            </WebLink>
                        </li>
                    </ul>
                </ContentCluster>
            </ContentClusterGroup>
            <Stack direction="column" fullWidth>
                <hr style={{ width: "100px" }} />
                <Stack direction="row" gap="5px">
                    <ColoredText color="secondary">
                        <i>Source commit:</i>
                    </ColoredText>
                    <WebLink
                        href={`https://github.com/Clemeit/ddo-audit-ui/commit/${getCommitHash()}`}
                        noDecoration
                    >
                        <i>{getCommitHash()?.slice(0, 7)}</i>
                    </WebLink>
                </Stack>
                <Stack direction="row" gap="5px">
                    <ColoredText color="secondary">
                        <i>Built at:</i>
                    </ColoredText>
                    <i>{getBuildTime()}</i>
                </Stack>
            </Stack>
        </Page>
    )
}

export default About
