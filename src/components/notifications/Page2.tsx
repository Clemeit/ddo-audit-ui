import React, { useState, useEffect } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import "./Page2.css"
import Button from "../global/Button.tsx"
import { MAX_LEVEL } from "../../constants/game.ts"
import { SERVER_NAMES } from "../../constants/servers.ts"
import { ReactComponent as Delete } from "../../assets/svg/delete.svg"

enum Operator {
    EQUALS = "is",
    CONTAINS = "contains",
    NOT_EQUALS = "is not",
    GREATER_THAN = ">",
    LESS_THAN = "<",
    GREATER_THAN_OR_EQUAL = ">=",
    LESS_THAN_OR_EQUAL = "<=",
    BETWEEN = "between",
}

interface Condition {
    field: string
    operator: Operator
    value: string
}

enum Difficulty {
    Casual = "Casual",
    Normal = "Normal",
    Hard = "Hard",
    Elite = "Elite",
    Reaper = "Reaper",
}

const Page2 = ({ setPage }: { setPage: Function }) => {
    const [conditionFunction, setConditionFunction] = useState("any")
    const [conditions, setConditions] = useState<Condition[]>([
        {
            field: "serverName",
            operator: Operator.EQUALS,
            value: "",
        },
    ])
    const fieldsList = [
        {
            key: "serverName",
            value: "Server name",
            validOperators: [Operator.EQUALS],
        },
        {
            key: "questName",
            value: "Quest name",
            validOperators: [
                Operator.EQUALS,
                Operator.CONTAINS,
                Operator.NOT_EQUALS,
            ],
        },
        {
            key: "leaderName",
            value: "Leader name",
            validOperators: [
                Operator.EQUALS,
                Operator.CONTAINS,
                Operator.NOT_EQUALS,
            ],
        },
        {
            key: "memberName",
            value: "Member name",
            validOperators: [
                Operator.EQUALS,
                Operator.CONTAINS,
                Operator.NOT_EQUALS,
            ],
        },
        {
            key: "difficulty",
            value: "Difficulty",
            validOperators: [
                Operator.EQUALS,
                Operator.NOT_EQUALS,
                Operator.GREATER_THAN,
                Operator.LESS_THAN,
                Operator.GREATER_THAN_OR_EQUAL,
                Operator.LESS_THAN_OR_EQUAL,
                Operator.BETWEEN,
            ],
        },
        {
            key: "level",
            value: "Level",
            validOperators: [
                Operator.GREATER_THAN,
                Operator.LESS_THAN,
                Operator.GREATER_THAN_OR_EQUAL,
                Operator.LESS_THAN_OR_EQUAL,
                Operator.BETWEEN,
            ],
        },
    ]

    const getValueField = (condition: Condition, index: number) => {
        if (condition.field === "serverName") {
            return (
                <select
                    className="inverted-select"
                    value={condition.value}
                    onChange={(e) => {
                        const newConditions = [...conditions]
                        newConditions[index].value = e.target.value
                        setConditions(newConditions)
                    }}
                >
                    {SERVER_NAMES.map((server) => (
                        <option key={server} value={server}>
                            {server}
                        </option>
                    ))}
                </select>
            )
        }

        if (condition.field === "difficulty") {
            if (condition.operator === Operator.BETWEEN) {
                return (
                    <>
                        <select
                            className="inverted-select"
                            value={
                                condition.value.split(",")[0] ||
                                Difficulty.Casual
                            }
                            onChange={(e) => {
                                const newConditions = [...conditions]
                                newConditions[index].value =
                                    `${e.target.value},${newConditions[index].value.split(",")[1] || Difficulty.Reaper}`
                                setConditions(newConditions)
                            }}
                        >
                            {Object.values(Difficulty).map((difficulty) => (
                                <option key={difficulty} value={difficulty}>
                                    {difficulty}
                                </option>
                            ))}
                        </select>
                        {" and "}
                        <select
                            className="inverted-select"
                            value={
                                condition.value.split(",")[1] ||
                                Difficulty.Reaper
                            }
                            onChange={(e) => {
                                const newConditions = [...conditions]
                                newConditions[index].value =
                                    `${newConditions[index].value.split(",")[0] || Difficulty.Casual},${e.target.value}`
                                setConditions(newConditions)
                            }}
                        >
                            {Object.values(Difficulty).map((difficulty) => (
                                <option key={difficulty} value={difficulty}>
                                    {difficulty}
                                </option>
                            ))}
                        </select>
                    </>
                )
            }

            return (
                <select
                    className="inverted-select"
                    value={condition.value}
                    onChange={(e) => {
                        const newConditions = [...conditions]
                        newConditions[index].value = e.target.value
                        setConditions(newConditions)
                    }}
                >
                    {Object.values(Difficulty).map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                            {difficulty}
                        </option>
                    ))}
                </select>
            )
        }

        if (
            condition.field === "level" &&
            condition.operator === Operator.BETWEEN
        ) {
            return (
                <>
                    <input
                        className="inverted-input"
                        value={condition.value.split(",")[0] || 1}
                        onChange={(e) => {
                            const newConditions = [...conditions]
                            newConditions[index].value =
                                `${e.target.value},${newConditions[index].value.split(",")[1] || MAX_LEVEL}`
                            setConditions(newConditions)
                        }}
                    />
                    {" and "}
                    <input
                        className="inverted-input"
                        value={condition.value.split(",")[1] || MAX_LEVEL}
                        onChange={(e) => {
                            const newConditions = [...conditions]
                            newConditions[index].value =
                                `${newConditions[index].value.split(",")[0] || 1},${e.target.value}`
                            setConditions(newConditions)
                        }}
                    />
                </>
            )
        }

        return (
            <input
                className="inverted-input"
                type="text"
                value={condition.value}
                onChange={(e) => {
                    const newConditions = [...conditions]
                    newConditions[index].value = e.target.value
                    setConditions(newConditions)
                }}
            />
        )
    }

    const getOperatorField = (condition: Condition, index: number) => {
        if (condition.field === "serverName") {
            return <span>is</span>
        }

        return (
            <select
                className="inverted-select"
                value={condition.operator}
                onChange={(e) => {
                    const newConditions = [...conditions]
                    newConditions[index].operator = e.target.value as Operator
                    setConditions(newConditions)
                }}
            >
                {Object.values(Operator)
                    .filter((operator) =>
                        fieldsList
                            .find((field) => field.key === condition.field)
                            ?.validOperators.includes(operator)
                    )
                    .map((operator) => (
                        <option key={operator} value={operator}>
                            {operator}
                        </option>
                    ))}
            </select>
        )
    }

    return (
        <ContentCluster title="New Rule">
            <h4>
                Notify me if{" "}
                <select
                    id="condition-function-select"
                    className="inverted-select"
                    value={conditionFunction}
                    onChange={(e) => setConditionFunction(e.target.value)}
                    defaultValue="any"
                >
                    <option key="any" value="any">
                        any
                    </option>
                    <option key="all" value="all">
                        all
                    </option>
                </select>{" "}
                of the following conditions are met:
            </h4>
            <ol className="conditions-list">
                {conditions.map((condition, index) => (
                    <li key={index}>
                        <Stack align="center" gap="5px">
                            <select
                                className="inverted-select"
                                value={condition.field}
                                onChange={(e) => {
                                    const newConditions = [...conditions]
                                    newConditions[index].field = e.target.value
                                    newConditions[index].operator =
                                        fieldsList.find(
                                            (field) =>
                                                field.key === e.target.value
                                        )?.validOperators[0] as Operator
                                    newConditions[index].value = ""
                                    setConditions(newConditions)
                                }}
                            >
                                {fieldsList.map((field) => (
                                    <option key={field.key} value={field.key}>
                                        {field.value}
                                    </option>
                                ))}
                            </select>
                            {getOperatorField(condition, index)}
                            {getValueField(condition, index)}
                            {index !== 0 || conditions.length > 1 ? (
                                <Button
                                    icon={<Delete />}
                                    type="tertiary"
                                    small
                                    onClick={() =>
                                        setConditions(
                                            conditions.filter(
                                                (_, i) => i !== index
                                            )
                                        )
                                    }
                                />
                            ) : null}
                        </Stack>
                    </li>
                ))}
                <li>
                    <Stack>
                        <Button
                            type="secondary"
                            small
                            onClick={() =>
                                setConditions([
                                    ...conditions,
                                    {
                                        field: "questName",
                                        operator: Operator.CONTAINS,
                                        value: "",
                                    },
                                ])
                            }
                        >
                            Add Condition
                        </Button>
                    </Stack>
                </li>
            </ol>
            <p className="secondary-text">Rules are not case-sensitive.</p>

            <Stack gap="10px" fullWidth>
                <Button type="secondary" onClick={() => setPage(1)}>
                    Cancel
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        // TODO
                    }}
                >
                    Save Rule
                </Button>
            </Stack>
        </ContentCluster>
    )
}

export default Page2
