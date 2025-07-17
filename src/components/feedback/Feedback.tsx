import React, { useState } from "react"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import WebLink from "../global/WebLink.tsx"
import ColoredText from "../global/ColoredText.tsx"
import { postFeedback } from "../../services/feedbackService.ts"
import ValidationMessage from "../global/ValidationMessage.tsx"
import Spacer from "../global/Spacer.tsx"

const Feedback = () => {
    const [message, setMessage] = React.useState("")
    const [contactInfo, setContactInfo] = React.useState("")
    const [wasFeedbackSubmitted, setWasFeedbackSubmitted] =
        React.useState(false)
    const [ticketNumber, setTicketNumber] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [showNoMessageValidation, setShowNoMessageValidation] =
        useState<boolean>(false)

    const resetForm = () => {
        setMessage("")
        setWasFeedbackSubmitted(false)
        setTicketNumber("")
        setIsLoading(false)
    }

    const submitFeedback = () => {
        if (!message || !message.trim()) {
            setShowNoMessageValidation(true)
            return
        }

        setIsLoading(true)

        const feedback = {
            message: message.trim(),
            contact: contactInfo || undefined,
        }

        postFeedback(feedback)
            .then((response) => {
                setMessage("")
                setContactInfo("")
                setWasFeedbackSubmitted(true)
                setTicketNumber(response.data.data.ticket || "N/A")
            })
            .catch((error) => {
                console.error("Error submitting feedback:", error)
                alert(
                    "There was an error submitting your feedback. Please try again later."
                )
            })
    }

    const feedbackCluster = (
        <>
            <ContentCluster
                title="Suggestions and Feedback"
                subtitle="Your feedback has made DDO Audit into what it is today. Let me know what you think!"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                    }}
                >
                    <Stack direction="column" gap="20px">
                        <Stack gap="10px" direction="column" fullWidth>
                            <label
                                htmlFor="suggestion-input"
                                className="input-label"
                            >
                                Your message:
                            </label>
                            <textarea
                                id="suggestion-input"
                                rows={4}
                                placeholder="What's on your mind?"
                                className="full-width"
                                style={{
                                    boxSizing: "border-box",
                                }}
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value)
                                    setShowNoMessageValidation(false)
                                }}
                            />
                            <ValidationMessage
                                message="The message field is required"
                                visible={showNoMessageValidation}
                            />
                        </Stack>
                        <Stack gap="10px" direction="column" fullWidth>
                            <label
                                htmlFor="suggestion-input"
                                className="input-label"
                            >
                                (Optional) Contact info:
                            </label>
                            <input
                                id="contact-info-input"
                                type="text"
                                placeholder="Discord name, forums link, email, etc."
                                className="full-width"
                                style={{
                                    boxSizing: "border-box",
                                }}
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                            />
                        </Stack>
                        <Stack gap="10px" fullWidth justify="space-between">
                            <div className="hide-on-mobile" />
                            <Button
                                type="primary"
                                onClick={submitFeedback}
                                className="full-width-mobile"
                                disabled={isLoading}
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
                    <WebLink href="https://www.daybreakgames.com/home">
                        Daybreak Game Company
                    </WebLink>
                    .{" "}
                    <ColoredText color="orange">
                        Please do not submit personal information, login
                        details, or bug reports related to the game.
                    </ColoredText>
                </p>
            </ContentCluster>
        </>
    )

    const thankYouCluster = (
        <ContentCluster title="Suggestions and Feedback">
            <p>
                Thank you for your feedback! Your input helps make DDO Audit
                better for everyone. If you have any further suggestions or
                feedback, feel free to reach out again.
            </p>
            <p>
                Thanks!
                <br />
                <i>Clemeit of Thelanis</i>
            </p>
            {wasFeedbackSubmitted && (
                <ColoredText color="secondary">
                    Ticket reference number: {ticketNumber}
                </ColoredText>
            )}
            <Spacer size="20px" />
            <Button type="secondary" onClick={() => resetForm()}>
                Submit another message
            </Button>
        </ContentCluster>
    )

    return (
        <Page
            title="Suggestions and Feedback"
            description="Do you have any suggestions or feedback for me? We would love to hear from you! Please fill out the form below and let me know your thoughts. Your feedback is important to me and will help me improve the website."
        >
            <ContentClusterGroup>
                {wasFeedbackSubmitted ? thankYouCluster : feedbackCluster}
            </ContentClusterGroup>
        </Page>
    )
}

export default Feedback
