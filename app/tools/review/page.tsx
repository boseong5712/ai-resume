"use client"

import { useRef, useState } from "react"
import {
    ArrowLeft,
    BriefcaseBusiness,
    CheckCircle2,
    CloudUpload,
    FilePenLine,
    FileText,
    LoaderCircle,
    Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ReviewMode = "direct" | "file" | "saved"

type SavedCoverLetter = {
    id: string
    title: string
    company?: string
    job?: string
    items?: Array<{
        question?: string
        answer?: string
    }>
    integratedCoverLetter?: string
}

type Criterion = {
    name: string
    score: number
    reason: string
    suggestion: string
}

type ReviewResult = {
    totalScore: number
    summary: string
    criteria: Criterion[]
    detailFeedback: string[]
    improvements: Array<{
        before: string
        after: string
        why: string
    }>
}

type SavedReview = {
    id: string
    title: string
    field: string
    content: string
    mode: ReviewMode
    result: ReviewResult
    createdAt: string
    updatedAt: string
}

const savedReviewStorageKey = "savedCoverLetterReviews"

const defaultCriteria = ["직무 적합성", "논리성", "구체성", "표현력", "완성도"]
const vagueExpressionPattern = /(성장했습니다|기여하고 싶습니다|열심히|다양한 경험|많은 것을 배웠습니다|최선을 다하겠습니다|도움이 될 것입니다|좋은 결과|노력하겠습니다)/
const resultExpressionPattern = /(성과|개선|향상|달성|완료|해결|기여|효율|정확도|만족도|결과)/
const jobExpressionPattern = /(직무|지원|회사|기업|업무|역량|프로젝트|전략|기획|개발|분석|고객|서비스|협업)/

function getCoverLetterText(coverLetter: SavedCoverLetter) {
    if (coverLetter.integratedCoverLetter?.trim()) return coverLetter.integratedCoverLetter
    return (coverLetter.items || [])
        .filter((item) => item.answer?.trim())
        .map((item) => `[${item.question || "자기소개서 항목"}]\n${item.answer}`)
        .join("\n\n")
}

function normalizeScore(score: unknown) {
    const parsed = Number(score)
    if (!Number.isFinite(parsed)) return 0
    return Math.max(0, Math.min(20, Math.round(parsed)))
}

function clampCriterionScore(score: number) {
    return Math.max(0, Math.min(20, Math.round(score)))
}

function countMatches(text: string, pattern: RegExp) {
    return text.match(pattern)?.length || 0
}

function splitSentences(text: string) {
    return text
        .replace(/\n+/g, " ")
        .split(/(?<=[.!?。]|[가-힣]\.)\s+|(?<=다\.)\s*/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 12)
}

function normalizeImprovementText(text: string) {
    return text.replace(/\s+/g, " ").trim()
}

function improveSentence(sentence: string, reasonType: "vague" | "long" | "result" | "job") {
    let after = sentence
        .replace(/성장했습니다/g, "구체적인 문제 해결 경험을 통해 실무 역량을 확장했습니다")
        .replace(/기여하고 싶습니다/g, "지원 직무에서 요구되는 역량을 바탕으로 실행 가능한 개선안을 제시하겠습니다")
        .replace(/열심히/g, "구체적인 목표를 세워 꾸준히")
        .replace(/다양한 경험/g, "직무와 연결되는 핵심 경험")
        .replace(/많은 것을 배웠습니다/g, "문제 원인을 분석하고 실행 가능한 대안을 도출하는 방법을 익혔습니다")
        .replace(/최선을 다하겠습니다/g, "입사 초기에는 업무 프로세스를 빠르게 파악하고, 이후 개선 과제를 제안하겠습니다")
        .replace(/도움이 될 것입니다/g, "실제 업무에서 문제를 구조화하고 개선안을 실행하는 데 활용하겠습니다")
        .replace(/좋은 결과/g, "측정 가능한 성과")
        .replace(/노력하겠습니다/g, "구체적인 실행 계획을 세우고 꾸준히 개선하겠습니다")
    let why = "추상적인 표현을 줄이고, 면접관이 확인하고 싶은 행동, 역할, 직무 연결성이 더 분명하게 드러나도록 다듬는 것이 좋습니다."

    if (reasonType === "long") {
        after = sentence.replace(/,?\s*(이를 통해|이 과정에서|그 결과|또한)\s*/g, ". $1 ")
        why = "한 문장에 정보가 많이 들어가면 핵심 행동과 결과가 흐려집니다. 문장을 나누어 상황, 행동, 결과가 순서대로 읽히게 하는 편이 좋습니다."
    }

    if (reasonType === "result") {
        after = sentence.replace(
            /(성과|결과|개선|향상|기여)(을|를|이|가)?/g,
            "구체적인 수치나 변화가 드러나는 성과$2",
        )
        why = "성과 표현은 있지만 변화 폭이나 기준이 부족합니다. 수치가 없다면 관찰 가능한 변화나 본인의 역할을 함께 적어 신뢰도를 높이세요."
    }

    if (reasonType === "job") {
        after = `${sentence} 이 경험은 지원 직무에서 요구되는 문제 정의, 실행, 협업 역량으로 연결됩니다.`
        why = "경험 자체는 드러나지만 지원 직무와의 연결 문장이 약합니다. 경험 뒤에 직무에서 어떻게 활용할지 한 문장을 붙이면 적합성이 높아집니다."
    }

    if (normalizeImprovementText(after) === normalizeImprovementText(sentence)) return null

    return {
        before: sentence,
        after,
        why,
    }
}

function buildLocalImprovements(sentences: string[]) {
    const candidates = sentences
        .map((sentence) => {
            if (vagueExpressionPattern.test(sentence)) return improveSentence(sentence, "vague")
            if (sentence.length > 120) return improveSentence(sentence, "long")
            if (resultExpressionPattern.test(sentence) && !/\d/.test(sentence)) return improveSentence(sentence, "result")
            if (!jobExpressionPattern.test(sentence) && sentence.length > 35) return improveSentence(sentence, "job")
            return null
        })
        .filter((item): item is NonNullable<ReturnType<typeof improveSentence>> => Boolean(item))

    return candidates.slice(0, 8)
}

function normalizeImprovements(
    improvements: ReviewResult["improvements"] | undefined,
    fallbackText: string,
) {
    const cleaned = (improvements || [])
        .map((item) => ({
            before: item.before?.trim() || "",
            after: item.after?.trim() || "",
            why: item.why?.trim() || "개선 전후의 차이가 더 분명하게 드러나도록 문장을 조정하세요.",
        }))
        .filter((item) => item.before && item.after)
        .filter((item) => normalizeImprovementText(item.before) !== normalizeImprovementText(item.after))

    if (cleaned.length > 0) return cleaned

    return createLocalReview(fallbackText).improvements
}

function parseReviewResult(text: string, fallbackText: string): ReviewResult {
    try {
        const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim()
        const parsed = JSON.parse(jsonText) as Partial<ReviewResult>
        const criteria = defaultCriteria.map((name, index) => {
            const item = parsed.criteria?.[index]
            return {
                name,
                score: normalizeScore(item?.score),
                reason: item?.reason || "평가 이유가 충분히 제공되지 않았습니다.",
                suggestion: item?.suggestion || "문장의 근거와 직무 연결성을 더 보강해보세요.",
            }
        })
        const totalScore = Math.max(0, Math.min(100, criteria.reduce((sum, item) => sum + item.score, 0)))

        return {
            totalScore,
            summary: parsed.summary || "자기소개서의 전반적인 흐름과 직무 연관성을 기준으로 평가했습니다.",
            criteria,
            detailFeedback: parsed.detailFeedback?.length
                ? parsed.detailFeedback
                : ["핵심 경험과 지원 직무의 연결이 더 분명해지면 설득력이 높아집니다."],
            improvements: normalizeImprovements(parsed.improvements, fallbackText),
        }
    } catch {
        return createLocalReview(fallbackText)
    }
}

function createLocalReview(text: string): ReviewResult {
    const noSpaceLength = text.replace(/\s/g, "").length
    const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
    const paragraphCount = paragraphs.length
    const sentences = splitSentences(text)
    const sentenceCount = sentences.length
    const numberCount = countMatches(text, /\d+[%년개월명회건점만억천]?/g)
    const resultWordCount = countMatches(text, /(성과|개선|향상|달성|완료|해결|기여|수상|선정|효율|정확도|만족도)/g)
    const jobWordCount = countMatches(text, /(직무|지원|회사|기업|업무|역량|프로젝트|전략|기획|개발|분석|고객|서비스|협업)/g)
    const actionWordCount = countMatches(text, /(분석|설계|개선|제안|구현|조율|관리|해결|도출|검토|작성|운영|협업|학습|적용)/g)
    const vagueWordCount = countMatches(text, /(열심히|최선을|많은 것을|다양한 경험|좋은 결과|성장했습니다|도움이 될 것입니다|노력하겠습니다)/g)
    const firstParagraph = paragraphs[0] || text.slice(0, 160)
    const lastParagraph = paragraphs[paragraphs.length - 1] || text.slice(-160)
    const improvements = buildLocalImprovements(sentences)
    const fitScore = clampCriterionScore(8 + Math.min(jobWordCount, 6) + (resultWordCount > 0 ? 2 : 0) + (firstParagraph.includes("지원") ? 1 : 0) - Math.min(vagueWordCount, 3))
    const logicScore = clampCriterionScore(8 + Math.min(paragraphCount, 4) * 2 + (sentenceCount >= 6 ? 2 : 0) + (/(따라서|이를 통해|이 과정에서|그 결과|반면|또한)/.test(text) ? 2 : 0) - (paragraphCount <= 1 ? 3 : 0))
    const specificityScore = clampCriterionScore(7 + Math.min(numberCount, 5) * 2 + Math.min(resultWordCount, 4) + (/(기간|역할|담당|프로젝트|사용|도구|기술)/.test(text) ? 2 : 0))
    const expressionScore = clampCriterionScore(15 - Math.min(vagueWordCount, 5) + Math.min(actionWordCount, 5) * 0.7 + (noSpaceLength > 700 ? 1 : 0))
    const completenessScore = clampCriterionScore(8 + (noSpaceLength >= 700 ? 3 : noSpaceLength >= 450 ? 2 : 0) + Math.min(paragraphCount, 4) + (lastParagraph.includes("기여") || lastParagraph.includes("입사") ? 2 : 0) - Math.min(vagueWordCount, 3))
    const criteria: Criterion[] = [
        {
            name: "직무 적합성",
            score: fitScore,
            reason: `지원 직무와 연결되는 표현이 ${jobWordCount}회, 성과·기여 표현이 ${resultWordCount}회 확인되었습니다.`,
            suggestion: fitScore >= 16
                ? "직무와 맞닿는 경험은 유지하되, 지원 회사의 실제 업무나 역할명과 한 번 더 연결하면 적합성이 더 선명해집니다. 경험을 나열하는 데서 끝내지 말고, 해당 역량이 입사 후 어떤 업무 성과로 이어질지까지 제시하세요."
                : "지원 직무에서 요구하는 핵심 역량과 본인의 경험을 더 직접적으로 연결해야 합니다. 첫 문단이나 마지막 문단에 경험으로 얻은 역량을 지원 직무의 구체적인 업무에 어떻게 활용할지 설명하세요.",
        },
        {
            name: "논리성",
            score: logicScore,
            reason: `문단은 ${paragraphCount}개, 의미 있는 문장은 약 ${sentenceCount}개로 구성되어 있습니다.`,
            suggestion: logicScore >= 16
                ? "문단 흐름은 안정적입니다. 각 문단 첫 문장을 핵심 주장으로 시작하고, 뒤따르는 문장에서 근거와 결과를 제시하면 메시지가 더 또렷해집니다."
                : "주장과 근거가 섞여 보이지 않도록 경험을 상황, 행동, 결과 순서로 재배치하는 것이 좋습니다. 마지막 문단은 배운 점과 입사 후 기여 가능성으로 마무리해 글의 방향을 분명히 하세요.",
        },
        {
            name: "구체성",
            score: specificityScore,
            reason: `수치·기간 표현은 ${numberCount}개, 행동 동사는 ${actionWordCount}개 확인되었습니다.`,
            suggestion: specificityScore >= 16
                ? "구체적인 근거가 잘 드러나는 편입니다. 성과를 말하기 전에 본인이 맡은 역할, 사용한 방법, 의사결정 과정을 간단히 배치하면 책임 범위가 더 선명해집니다."
                : "경험의 신뢰도를 높이려면 기간, 담당 역할, 사용한 도구, 성과 변화를 보강해야 합니다. 수치가 없다면 전후 변화나 주변 평가처럼 관찰 가능한 결과를 넣어 구체성을 높이세요.",
        },
        {
            name: "표현력",
            score: expressionScore,
            reason: `추상 표현은 ${vagueWordCount}개, 행동 중심 표현은 ${actionWordCount}개 확인되었습니다.`,
            suggestion: expressionScore >= 16
                ? "표현은 전반적으로 자연스럽습니다. 행동이 보이는 문장을 중심으로 유지하고, 반복되는 어미나 비슷한 문장 길이를 조정하면 더 읽기 편해집니다."
                : "추상적인 표현은 설득력이 약하므로 행동 중심의 동사로 바꾸는 것이 좋습니다. 감상이나 다짐보다 분석, 제안, 실행, 개선, 공유처럼 실제 행동이 드러나는 표현을 사용하세요.",
        },
        {
            name: "완성도",
            score: completenessScore,
            reason: `공백 제외 ${noSpaceLength}자이며, 도입과 마무리 구조를 함께 확인했습니다.`,
            suggestion: completenessScore >= 16
                ? "전체 완성도는 좋은 편입니다. 마지막 문단에 입사 후 우선 실행할 과제나 협업 방식을 한 문장 더 넣으면 마무리가 더 선명해집니다."
                : "도입, 경험 설명, 마무리의 역할을 더 분명하게 나누는 것이 좋습니다. 마지막 문단에는 포부만 쓰기보다 입사 후 초기 기여 방식이나 협업 태도를 구체적으로 제시하세요.",
        },
    ]
    const strongest = criteria.reduce((best, item) => (item.score > best.score ? item : best), criteria[0])
    const weakest = criteria.reduce((worst, item) => (item.score < worst.score ? item : worst), criteria[0])

    return {
        totalScore: criteria.reduce((sum, item) => sum + item.score, 0),
        summary: `면접관 관점에서 볼 때 이 자기소개서는 ${strongest.name}이 가장 강하게 드러나며, ${weakest.name} 보완이 우선입니다. 글의 길이, 수치 근거, 직무 연결 표현을 기준으로 종합 평가했습니다.`,
        criteria,
        detailFeedback: [
            `${strongest.name} 측면에서는 지원자의 강점이 비교적 잘 전달됩니다. 다만 이 강점이 회사의 실제 업무 환경에서 어떻게 발휘될지까지 보여주면 더 설득력 있는 자기소개서가 됩니다.`,
            `${weakest.name} 측면은 보완이 필요합니다. 면접관 입장에서는 지원자가 어떤 상황에서 어떤 판단을 했고, 그 결과 무엇을 배웠는지 더 명확히 확인하고 싶습니다.`,
            "전체적으로 지원 의지는 드러나지만, 경험의 의미를 지원 직무와 연결하는 마무리가 더 강해질 필요가 있습니다. 단순한 포부보다 입사 후 바로 적용 가능한 행동 계획을 보여주는 방향이 좋습니다.",
        ],
        improvements,
    }
}

function ScoreDonut({ score }: { score: number }) {
    const percent = Math.max(0, Math.min(100, score))

    return (
        <div
            className="relative flex h-44 w-44 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#347cff ${percent * 3.6}deg, #e8eef8 0deg)` }}
        >
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-4xl font-extrabold text-[#1760d6]">{score}</span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>
        </div>
    )
}

function saveReviewToStorage(review: Omit<SavedReview, "id" | "createdAt" | "updatedAt">) {
    if (typeof window === "undefined") return

    const now = new Date().toISOString()
    const savedReview: SavedReview = {
        ...review,
        id: `review-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
    }
    const existing = JSON.parse(localStorage.getItem(savedReviewStorageKey) || "[]") as SavedReview[]

    localStorage.setItem(savedReviewStorageKey, JSON.stringify([savedReview, ...existing]))
}

export default function ReviewPage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [mode, setMode] = useState<ReviewMode>("direct")
    const [title, setTitle] = useState("")
    const [field, setField] = useState("")
    const [content, setContent] = useState("")
    const [fileName, setFileName] = useState("")
    const [savedCoverLetters] = useState<SavedCoverLetter[]>(() => {
        if (typeof window === "undefined") return []
        return JSON.parse(localStorage.getItem("savedCoverLetters") || "[]") as SavedCoverLetter[]
    })
    const [selectedSavedId, setSelectedSavedId] = useState("")
    const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null)
    const [reviewing, setReviewing] = useState(false)
    const [resultView, setResultView] = useState(false)

    const selectSavedCoverLetter = (coverLetter: SavedCoverLetter) => {
        setSelectedSavedId(coverLetter.id)
        setTitle(coverLetter.title)
        setField(coverLetter.job || "")
        setContent(getCoverLetterText(coverLetter))
        setReviewResult(null)
        setResultView(false)
    }

    const handleFileChange = async (file?: File) => {
        if (!file) return
        setFileName(file.name)
        setReviewResult(null)
        setResultView(false)

        const text = await file.text()
        setContent(text.slice(0, 10000))
        if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""))
    }

    const evaluateCoverLetter = async () => {
        const text = content.trim()
        if (!text) return

        setReviewing(true)

        try {
            const response = await fetch("/api/cover-letter/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "evaluate",
                    question: title,
                    text,
                    context: {
                        job: field,
                    },
                }),
            })
            const data = (await response.json()) as { text?: string }
            const result = response.ok && data.text
                ? parseReviewResult(data.text, text)
                : createLocalReview(text)

            saveReviewToStorage({
                title: title.trim() || "자기소개서 평가",
                field: field.trim(),
                content: text,
                mode,
                result,
            })
            setReviewResult(result)
            setResultView(true)
        } catch {
            const result = createLocalReview(text)
            saveReviewToStorage({
                title: title.trim() || "자기소개서 평가",
                field: field.trim(),
                content: text,
                mode,
                result,
            })
            setReviewResult(result)
            setResultView(true)
        } finally {
            setReviewing(false)
        }
    }

    const modeCards = [
        {
            id: "direct" as const,
            icon: FilePenLine,
            title: "직접 입력",
            desc: "자기소개서 내용을 직접 입력하여 평가받습니다. 새로운 자기소개서나 수정된 내용을 평가받고 싶을 때 선택하세요.",
        },
        {
            id: "file" as const,
            icon: CloudUpload,
            title: "파일 업로드",
            desc: "자기소개서 파일을 업로드하여 평가받습니다. 기존 문서를 그대로 평가받고 싶을 때 선택하세요.",
        },
        {
            id: "saved" as const,
            icon: FileText,
            title: "저장된 자기소개서",
            desc: "이전에 작성한 자기소개서를 선택하여 평가받습니다. 저장된 자기소개서를 바로 평가받고 싶을 때 선택하세요.",
        },
    ]

    if (resultView && reviewResult) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-8">
                <div className="mx-auto w-full max-w-[1040px] space-y-6">
                    <section className="rounded-[28px] border border-slate-200 bg-white px-9 py-8 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setResultView(false)}
                            className="mb-7 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#347cff]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            평가 입력으로 돌아가기
                        </button>
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#347cff]">
                                    면접관 AI 평가 결과
                                </p>
                                <h1 className="text-3xl font-extrabold text-slate-900">
                                    {title || "자기소개서"} 평가 결과
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                                    {reviewResult.summary}
                                </p>
                            </div>
                            <ScoreDonut score={reviewResult.totalScore} />
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-3 md:grid-cols-5">
                        {reviewResult.criteria.map((criterion) => (
                            <div key={criterion.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm font-extrabold text-slate-800">{criterion.name}</p>
                                <div className="mt-4 flex items-end gap-1">
                                    <span className="text-3xl font-extrabold text-[#347cff]">{criterion.score}</span>
                                    <span className="pb-1 text-sm font-bold text-slate-400">/20</span>
                                </div>
                                <div className="mt-4 h-2 rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-[#347cff]"
                                        style={{ width: `${(criterion.score / 20) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[0.95fr_1.25fr]">
                        <div className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                                <CheckCircle2 className="h-5 w-5 text-[#347cff]" />
                                상세 피드백
                            </h2>
                            <div className="mt-5 space-y-4">
                                {reviewResult.criteria.map((criterion) => (
                                    <div key={criterion.name} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-slate-900">{criterion.name}</p>
                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-[#347cff]">
                                                {criterion.score}/20
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{criterion.reason}</p>
                                        <p className="mt-3 rounded-xl bg-white p-3 text-sm font-semibold leading-6 text-slate-700">
                                            <span className="text-[#347cff]">개선 방향</span> · {criterion.suggestion}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="min-w-0 space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                                    <Sparkles className="h-5 w-5 fill-blue-500 text-blue-500" />
                                    면접관 코멘트
                                </h2>
                                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                                    {reviewResult.detailFeedback.map((feedback, index) => (
                                        <li key={`${feedback}-${index}`} className="rounded-xl bg-slate-50 p-4">
                                            {feedback}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-extrabold text-slate-900">문장 개선사항</h2>
                                <div className="mt-5 space-y-4">
                                    {reviewResult.improvements.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                                            바로 수정이 필요한 문장이 발견되지 않았습니다.
                                        </div>
                                    ) : (
                                        reviewResult.improvements.map((item, index) => (
                                            <div key={`${item.before}-${index}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                                                <p className="text-xs font-bold text-rose-500">기존 문장</p>
                                                <p className="mt-2 rounded-xl bg-rose-50/50 p-3 text-sm leading-6 text-slate-600">{item.before}</p>
                                                <p className="mt-4 text-xs font-bold text-[#347cff]">개선 문장</p>
                                                <p className="mt-2 rounded-xl bg-blue-50/70 p-3 text-sm font-semibold leading-6 text-slate-800">{item.after}</p>
                                                <p className="mt-3 text-xs leading-5 text-slate-500">{item.why}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto w-full max-w-[760px] space-y-6">
                <section className="rounded-2xl border border-[#edf1fa] bg-white px-8 py-7 shadow-sm">
                    <h1 className="text-3xl font-extrabold text-slate-900">자기소개서 평가</h1>
                    <p className="mt-3 text-sm text-slate-500">
                        AI가 당신의 자기소개서를 분석하고 개선점을 제안해드립니다.
                    </p>
                </section>

                <div className="space-y-4">
                    <label className="block text-sm font-extrabold text-slate-900">
                        <span className="mr-2 text-[#347cff]">H</span>평가 제목
                    </label>
                    <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="평가 제목을 입력하세요"
                        className="h-12 rounded-xl border-slate-200 bg-white px-4"
                    />

                    <label className="block text-sm font-extrabold text-slate-900">
                        <BriefcaseBusiness className="mr-2 inline h-4 w-4 text-[#347cff]" />
                        지원 분야
                    </label>
                    <Input
                        value={field}
                        onChange={(event) => setField(event.target.value)}
                        placeholder="지원 분야를 입력하세요"
                        className="h-12 rounded-xl border-slate-200 bg-white px-4"
                    />
                </div>

                <section className="grid grid-cols-2 gap-4">
                    {modeCards.map((card) => {
                        const Icon = card.icon
                        const active = mode === card.id

                        return (
                            <button
                                key={card.id}
                                type="button"
                                onClick={() => {
                                    setMode(card.id)
                                    setReviewResult(null)
                                    setResultView(false)
                                }}
                                className={`rounded-xl border p-6 text-left transition ${
                                    active
                                        ? "border-[#347cff] bg-[#eef5ff]"
                                        : "border-slate-200 bg-white hover:border-blue-200"
                                }`}
                            >
                                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#347cff] text-white">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <h2 className="font-extrabold text-slate-900">{card.title}</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-500">{card.desc}</p>
                            </button>
                        )
                    })}
                </section>

                {mode === "direct" && (
                    <div className="relative">
                        <Textarea
                            value={content}
                            onChange={(event) => {
                                setContent(event.target.value.slice(0, 10000))
                                setReviewResult(null)
                                setResultView(false)
                            }}
                            placeholder="자기소개서 내용을 입력하세요..."
                            className="min-h-[280px] resize-y rounded-xl border-slate-200 bg-white p-5 text-sm leading-7"
                        />
                        <span className="absolute bottom-4 right-4 text-xs text-slate-400">
                            {content.length}/10000
                        </span>
                    </div>
                )}

                {mode === "file" && (
                    <section className="rounded-xl border border-slate-200 bg-white p-6">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.md,.doc,.docx"
                            className="hidden"
                            onChange={(event) => handleFileChange(event.target.files?.[0])}
                        />
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-11 rounded-xl bg-[#347cff] px-5 font-bold text-white hover:bg-blue-700"
                        >
                            <CloudUpload className="mr-2 h-4 w-4" />
                            파일 선택 및 업로드
                        </Button>
                        <span className="ml-4 text-sm font-semibold text-emerald-600">
                            {fileName || "선택된 파일 없음"}
                        </span>
                    </section>
                )}

                {mode === "saved" && (
                    <section className="grid grid-cols-2 gap-4">
                        {savedCoverLetters.length === 0 ? (
                            <div className="col-span-2 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                                저장된 자기소개서가 없습니다.
                            </div>
                        ) : (
                            savedCoverLetters.map((coverLetter) => (
                                <button
                                    key={coverLetter.id}
                                    type="button"
                                    onClick={() => selectSavedCoverLetter(coverLetter)}
                                    className={`rounded-xl border bg-white p-5 text-left transition ${
                                        selectedSavedId === coverLetter.id
                                            ? "border-[#347cff] bg-[#eef5ff]"
                                            : "border-slate-200 hover:border-blue-200"
                                    }`}
                                >
                                    <h3 className="font-extrabold text-slate-900">{coverLetter.title}</h3>
                                    <p className="mt-2 text-sm font-semibold text-[#347cff]">{coverLetter.company || "회사 미입력"}</p>
                                    <p className="mt-3 text-sm text-slate-500">{coverLetter.job || "질문 정보 없음"}</p>
                                </button>
                            ))
                        )}
                    </section>
                )}

                <div className="flex justify-center">
                    <Button
                        type="button"
                        disabled={reviewing || !content.trim()}
                        onClick={evaluateCoverLetter}
                        className="h-12 w-[330px] rounded-xl bg-[#347cff] font-extrabold text-white disabled:bg-slate-300"
                    >
                        {reviewing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        자기소개서 평가하기
                    </Button>
                </div>
            </div>
        </div>
    )
}
