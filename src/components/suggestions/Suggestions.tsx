import React from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"

const Suggestions = () => {
    return (
        <Page
            title="Suggestions and Feedback"
            description="Do you have any suggestions or feedback for me? We would love to hear from you! Please fill out the form below and let me know your thoughts. Your feedback is important to me and will help me improve the website."
        >
            <Stack direction="column" gap="20px" fullWidth>
                <ContentCluster
                    title="Suggestions and Feedback"
                    subtitle="Your feedback has made DDO Audit into what it is today. Let me know what you think!"
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                        }}
                    >
                        <Stack direction="column" gap="10px" fullWidth>
                            <div className="full-width">
                                <label
                                    htmlFor="suggestion-input"
                                    className="input-label"
                                >
                                    Your message:
                                </label>
                                <textarea
                                    id="suggestion-input"
                                    // multi-line:
                                    rows={4}
                                    placeholder="What's on your mind?"
                                    className="full-width"
                                    style={{
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                            <div className="full-width">
                                <label
                                    htmlFor="contact-info-input"
                                    className="input-label"
                                >
                                    Contact info (optional):
                                </label>
                                <input
                                    id="contact-info-input"
                                    type="text"
                                    placeholder="Discord, Forum name, email, etc."
                                    className="full-width"
                                    style={{
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                            <Stack gap="10px" fullWidth justify="space-between">
                                <div className="hide-on-mobile" />
                                <Button
                                    type="primary"
                                    onClick={() => {}}
                                    className="full-width-mobile"
                                >
                                    Submit
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </ContentCluster>
                <ContentCluster title="Disclaimer">
                    <p>
                        This website is in no way affiliated with or endorsed by
                        Standing Stone Games or{" "}
                        <a
                            href="https://www.daybreakgames.com/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                        >
                            Daybreak Game Company
                        </a>
                        .{" "}
                        <span className="orange-text">
                            Please do not submit personal information, login
                            details, or bug reports related to the game.
                        </span>
                    </p>
                </ContentCluster>
            </Stack>
        </Page>
    )
}

export default Suggestions
