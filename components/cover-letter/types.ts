export type EssayItem = {
    id: number
    question: string
    details: string[]
    answer: string
}

export type SavedCoverLetter = {
    id: string
    title: string
    company: string
    job: string
    careerType: string
    keywords: string[]
    tasks: string[]
    experiences: string[]
    situationSummary: string
    items: EssayItem[]
    integratedCoverLetter?: string
    status: "saved" | "draft"
    createdAt: string
    updatedAt: string
}

export type AIAction = "detail" | "draft" | "polish" | "integrate"
