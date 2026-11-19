// Registry of alert types the UI knows how to create and describe. Mirrors the backend registry
// (ddo-audit-service sanic/business/alerts). To add a type: add a folder next to lfmPosted with its
// form and summary, then register it below.

import React from "react"
import { LfmPostedCriteria } from "../../../models/Alert"
import LfmPostedCriteriaForm from "./lfmPosted/LfmPostedCriteriaForm"
import {
    defaultLfmPostedCriteria,
    summarizeLfmPosted,
    validateLfmPosted,
} from "./lfmPosted/summarize"

interface CriteriaFormProps<TCriteria> {
    criteria: TCriteria
    onChange: (criteria: TCriteria) => void
}

interface SummaryHelpers {
    questName: (id: number) => string | undefined
}

// The registry holds definitions with different criteria types, hence the `any` default.
interface AlertTypeDefinition<TCriteria = any> {
    type: string
    label: string
    description: string
    defaultCriteria: () => TCriteria
    CriteriaForm: React.ComponentType<CriteriaFormProps<TCriteria>>
    summarize: (criteria: TCriteria, helpers: SummaryHelpers) => string
    validate: (criteria: TCriteria) => string | null
}

const lfmPosted: AlertTypeDefinition<LfmPostedCriteria> = {
    type: "lfm_posted",
    label: "LFM posted",
    description: "When someone posts an LFM for one of your quests.",
    defaultCriteria: defaultLfmPostedCriteria,
    CriteriaForm: LfmPostedCriteriaForm,
    summarize: (criteria, { questName }) =>
        summarizeLfmPosted(criteria, questName),
    validate: validateLfmPosted,
}

const ALERT_TYPES: AlertTypeDefinition[] = [lfmPosted]

function getAlertTypeDefinition(type: string): AlertTypeDefinition | undefined {
    return ALERT_TYPES.find((t) => t.type === type)
}

export { ALERT_TYPES, getAlertTypeDefinition }
export type { AlertTypeDefinition, CriteriaFormProps, SummaryHelpers }
