import { useState } from "react"
import {
    BookOpen,
    BriefcaseBusiness,
    Building2,
    Check,
    ChevronDown,
    ChevronUp,
    Copy,
    Download,
    FilePenLine,
    KeyRound,
    Lightbulb,
    LoaderCircle,
    RotateCcw,
    Sparkles,
    Target,
    Trash2,
    Undo2,
    UserRound,
    WandSparkles,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    availableQuestions,
    fallbackDetailAnswer,
    generatedCoverLetter,
    generatedDetailAnswers,
    polishDirectionGroups,
    polishOptions,
    polishSubtitles,
    questionDetails,
    type PolishOptionId,
    type QuestionType,
} from "./constants"
import type { AIAction, EssayItem, SavedCoverLetter } from "./types"
import { countWithoutSpaces, createIntegratedFallback, downloadWordDocument } from "./utils"

type CoverLetterWriteStepProps = {
    documentTitle?: string
    company: string
    job: string
    careerType: string
    keywords: string[]
    tasks: string[]
    experiences: string[]
    situationSummary: string
    initialItems?: EssayItem[]
    initialSavedViewOpen?: boolean
    initialIntegratedCoverLetter?: string
    onBack: () => void
}

const guideItems = [
    {
        number: "1",
        title: "질문 선택",
        description: "준비된 질문을 선택하거나 직접 입력",
        icon: FilePenLine,
        color: "bg-blue-500",
    },
    {
        number: "2",
        title: "상세 답변",
        description: "더 구체적인 정보로 퀄리티 향상",
        icon: BookOpen,
        color: "bg-emerald-500",
    },
    {
        number: "3",
        title: "초안 생성",
        description: "AI가 맞춤형 자소서 작성",
        icon: WandSparkles,
        color: "bg-violet-500",
    },
    {
        number: "4",
        title: "부분 수정",
        description: "드래그로 선택하여 개별 수정",
        icon: Target,
        color: "bg-orange-500",
    },
]

function SummaryItem({
    icon: Icon,
    label,
    value,
    wide = false,
}: {
    icon: typeof BriefcaseBusiness
    label: string
    value: string
    wide?: boolean
}) {
    return (
        <div
            className={`flex h-11 items-center gap-2 rounded-lg border border-[#e7edff] bg-white px-4 text-sm ${wide ? "col-span-2" : ""}`}
        >
            <Icon className="h-4 w-4 text-[#326fff]" />
            <span className="font-semibold text-slate-600">{label}:</span>
            <span className="text-slate-800">{value}</span>
        </div>
    )
}

export function CoverLetterWriteStep({
    documentTitle,
    company,
    job,
    careerType,
    keywords,
    tasks,
    experiences,
    situationSummary,
    initialItems,
    initialSavedViewOpen = false,
    initialIntegratedCoverLetter = "",
    onBack,
}: CoverLetterWriteStepProps) {
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [guideOpen, setGuideOpen] = useState(true)
    const [writingStarted, setWritingStarted] = useState(false)
    const [items, setItems] = useState<EssayItem[]>(
        initialItems && initialItems.length > 0
            ? initialItems
            : [{ id: 1, question: "", details: ["", "", ""], answer: "" }]
    )
    const [questionMenuItemId, setQuestionMenuItemId] = useState<number | null>(null)
    const [detailItemId, setDetailItemId] = useState<number | null>(null)
    const [draftItemId, setDraftItemId] = useState<number | null>(null)
    const [generatingItemId, setGeneratingItemId] = useState<number | null>(null)
    const [polishItemId, setPolishItemId] = useState<number | null>(null)
    const [humanizeItemId, setHumanizeItemId] = useState<number | null>(null)
    const [selectedPolishOptionId, setSelectedPolishOptionId] = useState<PolishOptionId>("human")
    const [humanizeDirection, setHumanizeDirection] = useState("")
    const [humanizeRequest, setHumanizeRequest] = useState("")
    const [detailGeneratingIndex, setDetailGeneratingIndex] = useState<number | null>(null)
    const [polishing, setPolishing] = useState(false)
    const [aiNotice, setAiNotice] = useState("")
    const [lengthItemId, setLengthItemId] = useState<number | null>(null)
    const [targetLength, setTargetLength] = useState("1000")
    const [percentChange, setPercentChange] = useState("20")
    const [savedViewOpen, setSavedViewOpen] = useState(initialSavedViewOpen)
    const [integratedCoverLetter, setIntegratedCoverLetter] = useState(initialIntegratedCoverLetter)
    const [integrating, setIntegrating] = useState(false)
    const [integratedSaveNotice, setIntegratedSaveNotice] = useState("")
    const keywordSummary = keywords.length > 0 ? keywords.slice(0, 3).join(", ") : "HTML/CSS"
    const mainTask = tasks[0] || "성과 평가 및 개선 방안 제시"
    const experienceDetails = experiences.length > 0
        ? experiences
        : ["주요 경력:", "SK하이닉스 임원 (2개월)", "근", "전문 자격증:", "정보처리기사 (한국산업인력공단)"]
    const detailItem = items.find((item) => item.id === detailItemId)
    const draftItem = items.find((item) => item.id === draftItemId)
    const humanizeItem = items.find((item) => item.id === humanizeItemId)
    const selectedPolishOption = polishOptions.find((option) => option.id === selectedPolishOptionId) || polishOptions[0]
    const selectedPolishDirections = polishDirectionGroups[selectedPolishOptionId]
    const getDetailPrompts = (question: string) =>
        questionDetails[question as QuestionType] || questionDetails["장단점에 관하여"]

    const updateItem = (id: number, next: Partial<EssayItem>) => {
        setItems((currentItems) =>
            currentItems.map((item) => (item.id === id ? { ...item, ...next } : item))
        )
    }

    const requestAI = async (
        action: AIAction,
        fields: Record<string, unknown>
    ) => {
        const response = await fetch("/api/cover-letter/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action,
                context: { company, job, careerType, keywords, tasks, experiences, situationSummary },
                ...fields,
            }),
        })
        const data = (await response.json()) as { text?: string; error?: string; code?: string }

        if (!response.ok || !data.text) {
            if (data.code === "OPENAI_API_KEY_MISSING") {
                setAiNotice("OPENAI_API_KEY를 추가하면 실제 AI 결과가 생성됩니다. 현재는 미리보기 결과를 표시합니다.")
            } else if (data.code === "GEMINI_API_KEY_MISSING") {
                setAiNotice("GEMINI_API_KEY를 추가하면 실제 AI 결과가 생성됩니다. 현재는 미리보기 결과를 표시합니다.")
            } else {
                setAiNotice(data.error || "AI 처리 중 문제가 발생해 미리보기 결과를 표시합니다.")
            }
            throw new Error(data.error || "AI 응답 생성 실패")
        }

        setAiNotice("")
        return data.text
    }

    const chooseQuestion = (id: number, question: string) => {
        updateItem(id, { question, details: ["", "", ""], answer: "" })
        setQuestionMenuItemId(null)
        setDetailItemId(null)
        setDraftItemId(null)
        setPolishItemId(null)
        setLengthItemId(null)
        setAiNotice("")
    }

    const updateDetail = (index: number, value: string) => {
        if (!detailItem) return
        const nextDetails = [...detailItem.details]
        nextDetails[index] = value
        updateItem(detailItem.id, { details: nextDetails })
    }

    const generateDetail = async (index: number) => {
        if (!detailItem) return
        setDetailGeneratingIndex(index)
        try {
            const prompts = getDetailPrompts(detailItem.question)
            const text = await requestAI("detail", {
                question: detailItem.question,
                detailQuestion: prompts[index],
                detailAnswers: detailItem.details,
            })
            updateDetail(index, text)
        } catch {
            updateDetail(
                index,
                detailItem.question === "장단점에 관하여"
                    ? generatedDetailAnswers[index]
                    : fallbackDetailAnswer
            )
        } finally {
            setDetailGeneratingIndex(null)
        }
    }

    const openDraftPreview = (id: number) => {
        const item = items.find((candidate) => candidate.id === id)
        if (!item?.question) return
        setDraftItemId(id)
    }

    const beginGeneration = async (id: number) => {
        const item = items.find((candidate) => candidate.id === id)
        if (!item) return
        setDraftItemId(null)
        setDetailItemId(null)
        setGeneratingItemId(id)
        try {
            const text = await requestAI("draft", {
                question: item.question,
                detailAnswers: item.details,
                targetLength,
            })
            updateItem(id, { answer: text })
        } catch {
            await new Promise((resolve) => window.setTimeout(resolve, 1000))
            updateItem(id, { answer: generatedCoverLetter })
        } finally {
            setGeneratingItemId(null)
        }
    }

    const persistCoverLetter = (status: "saved" | "draft", integratedOverride = integratedCoverLetter) => {
        const now = new Date().toISOString()
        const savedItems = items.filter((item) => item.question.trim() || item.answer.trim())
        const storageKey = "savedCoverLetters"
        const current = JSON.parse(localStorage.getItem(storageKey) || "[]") as SavedCoverLetter[]
        const editingId = localStorage.getItem("editingCoverLetterId")
        const nextTitle =
            documentTitle?.trim() ||
            `${company || "지원회사"} ${job || "지원직무"} 자기소개서`
        const payload: SavedCoverLetter = {
            id: editingId || `cover-letter-${Date.now()}`,
            title: nextTitle,
            company,
            job,
            careerType,
            keywords,
            tasks,
            experiences,
            situationSummary,
            items: savedItems.length > 0 ? savedItems : items,
            integratedCoverLetter: integratedOverride,
            status,
            createdAt: current.find((item) => item.id === editingId)?.createdAt || now,
            updatedAt: now,
        }
        const next = current.some((item) => item.id === payload.id)
            ? current.map((item) => (item.id === payload.id ? payload : item))
            : [payload, ...current]

        localStorage.setItem(storageKey, JSON.stringify(next))
        localStorage.setItem("editingCoverLetterId", payload.id)
        return payload
    }

    const completeSave = () => {
        setQuestionMenuItemId(null)
        setDetailItemId(null)
        setDraftItemId(null)
        setPolishItemId(null)
        setLengthItemId(null)
        persistCoverLetter("saved")
        setSavedViewOpen(true)
    }

    const saveDraft = () => {
        persistCoverLetter("draft")
        alert("임시저장되었습니다.")
    }

    const integrateCoverLetters = async () => {
        const answeredItems = items.filter((item) => item.answer.trim())
        if (answeredItems.length === 0) return

        setIntegrating(true)
        setIntegratedSaveNotice("")
        try {
            const text = await requestAI("integrate", {
                answers: answeredItems.map((item) => ({
                    question: item.question,
                    answer: item.answer,
                })),
            })
            setIntegratedCoverLetter(text)
            persistCoverLetter("saved", text)
            setIntegratedSaveNotice("통합 자기소개서가 저장되었습니다.")
        } catch {
            const fallback = createIntegratedFallback(answeredItems)
            setIntegratedCoverLetter(fallback)
            persistCoverLetter("saved", fallback)
            setIntegratedSaveNotice("통합 자기소개서가 저장되었습니다.")
        } finally {
            setIntegrating(false)
        }
    }

    const saveIntegratedCoverLetter = () => {
        if (!integratedCoverLetter.trim()) return
        persistCoverLetter("saved", integratedCoverLetter)
        setIntegratedSaveNotice("통합 자기소개서가 저장되었습니다.")
    }

    const exportAllToWord = () => {
        const sections = integratedCoverLetter
            ? [`[통합 자기소개서]\n\n${integratedCoverLetter}`]
            : items
                .filter((item) => item.answer.trim())
                .map((item) => `[${item.question || "자기소개서 항목"}]\n\n${item.answer}`)
        downloadWordDocument(`${company || "지원회사"}_자기소개서`, sections.join("\n\n"))
    }

    const addItem = () => {
        setItems((currentItems) => [
            ...currentItems,
            { id: currentItems.length + 1, question: "", details: ["", "", ""], answer: "" },
        ])
    }

    const removeItem = (id: number) => {
        setItems((currentItems) =>
            currentItems.length === 1
                ? [{ id: 1, question: "", details: ["", "", ""], answer: "" }]
                : currentItems.filter((item) => item.id !== id)
        )
    }

    const openPolishModal = (id: number, optionId: PolishOptionId) => {
        setPolishItemId(null)
        setHumanizeItemId(id)
        setSelectedPolishOptionId(optionId)
        setHumanizeDirection("")
        setHumanizeRequest("")
    }

    const createCustomHumanizeAddition = (request: string) => {
        const additions: string[] = []

        if (request.includes("구체") || request.includes("경험")) {
            additions.push("특히 성과 평가 기준을 항목별로 정리하고 시각화 자료로 공유하며 개선안을 설득력 있게 전달한 경험이 있습니다.")
        }
        if (request.includes("성과") || request.includes("수치")) {
            additions.push("그 결과 성과 측정의 정확도를 15% 높였다는 수치로 개선 효과를 확인할 수 있었습니다.")
        }
        if (request.includes("보람") || request.includes("감정") || request.includes("느낀")) {
            additions.push("제가 제안한 변화가 실제 결과로 이어졌을 때의 보람은 새로운 과제에도 주저하지 않고 도전하게 하는 힘이 되었습니다.")
        }

        return additions.length > 0
            ? additions.join(" ")
            : "이 경험을 통해 결과뿐 아니라 과정에서 배우고 성장하는 태도가 중요하다는 점을 깊이 깨달았습니다."
    }

    const createFallbackHumanizedText = () => {
        if (!humanizeItem) return

        let revised = humanizeItem.answer || generatedCoverLetter
        const selectedDirection = selectedPolishDirections.find((item) => item.id === humanizeDirection)
        const directionText: Record<string, string> = {
            natural: "짧은 경험이었지만, 숫자로 확인되는 변화를 만들어내는 과정은 제게 오래 남는 배움이 되었습니다.",
            personal: "처음에는 짧은 재직 기간이 약점처럼 느껴졌지만, 주어진 시간 안에 결과를 내기 위해 누구보다 치열하게 고민했습니다.",
            emotion: "개선안이 실제 성과로 이어지는 모습을 확인했을 때 느꼈던 보람은 지금도 새로운 도전을 선택하게 하는 원동력입니다.",
            story: "처음 업무를 맡았을 때 제 앞에 놓인 과제는 짧은 시간 안에 성과를 객관적으로 설명할 방법을 찾는 일이었습니다.",
            empathy: "성과 지표를 개선하는 일은 결국 함께 일하는 구성원들이 더 명확하게 방향을 이해하도록 돕는 일이라고 생각합니다.",
            tone: "문장마다 다른 어조를 정돈해 지원자의 강점이 일관된 목소리로 전달되도록 다듬었습니다.",
            tense: "경험 설명은 과거형으로, 포부와 기여 계획은 현재·미래형으로 정리해 흐름을 안정적으로 만들었습니다.",
            terms: "반복되는 개념은 같은 용어로 통일해 읽는 사람이 핵심 역량을 더 쉽게 따라갈 수 있도록 했습니다.",
            balance: "문단별 길이와 정보량을 조정해 도입, 경험, 마무리의 비중이 균형 있게 보이도록 다듬었습니다.",
            logic: "문장 사이의 연결을 보강해 경험에서 배운 점과 지원 직무의 연관성이 자연스럽게 이어지도록 했습니다.",
            business: "업무 맥락에 맞는 표현을 사용해 더 전문적이고 신뢰감 있는 비즈니스 톤으로 정리했습니다.",
            results: "성과와 결과가 더 선명하게 드러나도록 행동과 변화의 흐름을 중심으로 표현을 강화했습니다.",
            leadership: "주도적으로 판단하고 실행한 부분이 보이도록 리더십과 책임감을 드러내는 표현을 보강했습니다.",
            competency: "직무 수행에 필요한 역량이 더 분명하게 전달되도록 경험과 기술을 업무 관점에서 정리했습니다.",
            expertise: "해당 분야에 대한 이해와 전문성이 드러나도록 직무 관련 표현을 더 정교하게 다듬었습니다.",
            simple: "복잡한 문장을 쉬운 표현으로 풀어 읽는 사람이 핵심 내용을 빠르게 이해할 수 있도록 했습니다.",
            structure: "문장의 주어와 서술을 명확히 정리해 논리적인 구조로 읽히도록 개선했습니다.",
            examples: "경험이 추상적으로 보이지 않도록 구체적인 상황과 행동을 중심으로 표현을 보강했습니다.",
            remove: "중복되거나 장황한 표현을 줄여 핵심 메시지가 더 또렷하게 보이도록 정리했습니다.",
            flow: "문단 사이의 연결 표현을 보강해 전체 흐름이 자연스럽게 이어지도록 다듬었습니다.",
            narrative: "경험을 시작, 문제 인식, 실행, 결과의 흐름으로 재구성해 이야기처럼 읽히게 했습니다.",
            scene: "상황과 배경이 더 생생하게 떠오르도록 경험의 맥락을 보강했습니다.",
            conflict: "어려움과 해결 과정을 강조해 지원자의 문제 해결력이 더 잘 드러나도록 했습니다.",
            growth: "경험 전후의 변화와 배운 점을 중심으로 성장 과정이 보이게 다듬었습니다.",
            hook: "도입부에 관심을 끄는 문제 상황이나 강점을 배치해 첫인상을 강화했습니다.",
        }

        if (selectedPolishOptionId === "human") {
            revised = revised
                .replace("맡아온 경험을 가지고 있습니다.", "맡으며 직접 부딪치고 배운 경험이 있습니다.")
                .replace("큰 도움이 될 것이라 확신합니다.", "삼성전자에서도 제 강점으로 이어질 것이라 믿습니다.")
                .replace("강화하고자 합니다.", "한 단계 더 키워가고 싶습니다.")
                .replace("가치 있는 통찰을 제공할 수 있는 기반이 됩니다.", "현장에서 실질적인 해답을 찾는 힘이 되었습니다.")
                .replace("기여하고자 합니다.", "기여하고 싶습니다.")
                .replace("인재가 되고자 합니다.", "구성원으로 성장하고 싶습니다.")
        } else if (selectedPolishOptionId === "consistent") {
            revised = revised.replace(/합니다\./g, "했습니다.").replace(/싶습니다\./g, "하겠습니다.")
        } else if (selectedPolishOptionId === "professional") {
            revised = revised.replace(/고민했습니다/g, "검토했습니다").replace(/도움이/g, "기여가")
        } else if (selectedPolishOptionId === "clear") {
            revised = revised.replace(/단순히/g, "단순히").replace(/기반이 될 것입니다/g, "기반이 됩니다")
        } else if (selectedPolishOptionId === "story") {
            revised = revised.replace(/^저는/m, "처음 이 경험을 마주했을 때, 저는")
        }

        const addition = humanizeRequest.trim()
            ? createCustomHumanizeAddition(humanizeRequest.trim())
            : directionText[humanizeDirection] || (selectedDirection ? `${selectedDirection.title} 방향으로 문장과 흐름을 다듬었습니다.` : "")
        if (addition) {
            const firstBreak = revised.indexOf("\n\n", revised.indexOf("\n") + 1)
            revised = firstBreak >= 0
                ? `${revised.slice(0, firstBreak)} ${addition}${revised.slice(firstBreak)}`
                : `${revised}\n\n${addition}`
        }

        return revised
    }

    const applyHumanize = async () => {
        if (!humanizeItem) return
        const fallbackText = createFallbackHumanizedText()
        if (!fallbackText) return

        setPolishing(true)
        try {
            const direction = selectedPolishDirections.find((item) => item.id === humanizeDirection)
            const polishDirection = [
                selectedPolishOption.title,
                selectedPolishOption.description,
                direction ? `${direction.title}: ${direction.description}` : "",
            ].filter(Boolean).join(" / ")
            const text = await requestAI("polish", {
                text: humanizeItem.answer || generatedCoverLetter,
                polishDirection,
                customRequest: humanizeRequest.trim(),
            })
            updateItem(humanizeItem.id, { answer: text })
        } catch {
            updateItem(humanizeItem.id, { answer: fallbackText })
        } finally {
            setPolishing(false)
            setHumanizeItemId(null)
        }
    }

    const answeredItems = items.filter((item) => item.answer.trim())

    if (savedViewOpen) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-8">
                <div className="mx-auto w-full max-w-[920px] rounded-[20px] bg-white p-7 shadow-[0_4px_22px_rgba(38,60,112,0.08)]">
                    <div className="mb-7">
                        <h1 className="text-2xl font-extrabold text-slate-900">자소서 조회</h1>
                        <p className="mt-2 text-sm text-slate-500">작성한 자기소개서 항목을 확인하고 수정하거나 내보낼 수 있습니다.</p>
                    </div>

                    <section className="mb-6 rounded-xl border border-[#d7e5ff] bg-[#fbfcff] p-5">
                        <h2 className="mb-3 text-base font-bold text-slate-800">🚩 자소서 제목</h2>
                        <div className="rounded-lg border border-[#e2e8f8] bg-white px-4 py-3 text-sm text-slate-700">
                            {documentTitle || `${company || "지원회사"} ${job || "지원직무"} 자기소개서`}
                        </div>
                    </section>

                    <section className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800">📄 자소서 내용 <span className="text-xs text-slate-400">({answeredItems.length}개 항목)</span></h2>
                            <Button
                                type="button"
                                onClick={integrateCoverLetters}
                                disabled={integrating || answeredItems.length === 0}
                                className="h-10 rounded-lg bg-[#397df0] px-4 text-sm font-bold text-white hover:bg-blue-700"
                            >
                                {integrating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                자소서 통합하기
                            </Button>
                        </div>

                        {answeredItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                                저장된 자기소개서 내용이 없습니다. 수정하기를 눌러 항목을 작성해주세요.
                            </div>
                        ) : (
                            answeredItems.map((item, index) => (
                                <article key={item.id} className="rounded-xl border border-[#e2e8f8] bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#347cff] text-xs text-white">
                                                Q{index + 1}
                                            </span>
                                            {item.question || "자기소개서 항목"}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-[#347cff]">공백 제외 {countWithoutSpaces(item.answer)}자</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => downloadWordDocument(item.question || "자기소개서", item.answer)}
                                                className="h-8 px-3 text-xs"
                                            >
                                                <Download className="mr-1 h-3 w-3" />
                                                출력
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-[#e7edff] bg-[#fbfcff] p-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                                        {item.answer}
                                    </div>
                                </article>
                            ))
                        )}

                        {integratedCoverLetter && (
                            <article className="rounded-xl border-2 border-[#347cff] bg-[#f7faff] p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#1760d6]">
                                        <Sparkles className="h-5 w-5 fill-blue-500 text-blue-500" />
                                        통합 자기소개서
                                    </h3>
                                    <span className="text-xs font-semibold text-[#347cff]">
                                        공백 제외 {countWithoutSpaces(integratedCoverLetter)}자
                                    </span>
                                </div>
                                <Textarea
                                    value={integratedCoverLetter}
                                    onChange={(event) => {
                                        setIntegratedCoverLetter(event.target.value)
                                        setIntegratedSaveNotice("")
                                    }}
                                    className="min-h-[300px] resize-y rounded-lg border-[#d7e5ff] bg-white p-5 text-sm leading-7"
                                />
                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <p className="text-xs text-slate-500">
                                        반복되는 첫 문단 소개와 중복 표현을 줄이고, 전체 답변을 하나의 흐름으로 합친 결과입니다.
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={saveIntegratedCoverLetter}
                                        className="h-9 shrink-0 rounded-lg bg-[#397df0] px-4 text-xs font-bold text-white hover:bg-blue-700"
                                    >
                                        통합본 저장
                                    </Button>
                                </div>
                                {integratedSaveNotice && (
                                    <p className="mt-2 text-xs font-semibold text-emerald-600">{integratedSaveNotice}</p>
                                )}
                            </article>
                        )}
                    </section>

                    <footer className="mt-8 flex justify-center gap-3">
                        <Button
                            type="button"
                            onClick={() => setSavedViewOpen(false)}
                            className="h-11 rounded-lg bg-[#337bf2] px-8 text-sm font-bold text-white hover:bg-blue-700"
                        >
                            수정하기
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={exportAllToWord}
                            disabled={answeredItems.length === 0 && !integratedCoverLetter}
                            className="h-11 rounded-lg border-[#d7e5ff] px-8 text-sm font-bold text-slate-700"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Word로 내보내기
                        </Button>
                    </footer>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto w-full max-w-[900px] space-y-5 rounded-[20px] bg-white p-7 shadow-[0_4px_22px_rgba(38,60,112,0.08)]">
                <section className="relative overflow-hidden rounded-[20px] border border-[#edf1fa] bg-white px-8 py-8 text-center shadow-sm">
                    <span className="absolute left-3 top-8 h-1 w-1 rounded-full bg-blue-300" />
                    <span className="absolute bottom-4 left-2 h-8 w-8 rounded-full bg-violet-100/70 blur-lg" />
                    <span className="absolute right-3 top-2 h-9 w-9 rounded-full bg-blue-100 blur-lg" />
                    <h1 className="flex items-center justify-center gap-2 text-[30px] font-extrabold text-[#1760d6]">
                        <Sparkles className="h-7 w-7 fill-blue-500 text-blue-500" />
                        자기소개서 생성기
                    </h1>
                    <p className="mt-3 text-sm text-slate-500">
                        AI가 준비한 질문들에 답하거나 직접 작성하여 개성 있는 자기소개서를 만들어보세요.
                    </p>
                </section>

                <section className="rounded-[18px] border border-[#edf1fa] px-6 py-5 shadow-sm">
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-violet-500 text-white">
                            <FilePenLine className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">진행 상황</h2>
                            <p className="mt-0.5 text-xs text-slate-400">질문에 답하여 자소서를 완성하세요</p>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#347cff] text-white shadow-[0_0_0_4px_#edf4ff]">
                            <Check className="h-4 w-4" />
                        </span>
                        <span className="h-px flex-1 bg-[#337bff]" />
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#347cff] text-sm font-bold text-white shadow-[0_0_0_4px_#edf4ff]">
                            2
                        </span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs">
                        <span className="text-slate-400">기본 정보</span>
                        <span className="font-semibold text-[#347cff]">본문 작성</span>
                    </div>
                </section>

                <section className="rounded-[18px] border border-[#d7e5ff] bg-[#fbfcff] p-6 shadow-[0_2px_9px_rgba(28,92,218,0.08)]">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#347cff] text-white">
                                <FilePenLine className="h-4 w-4" />
                            </span>
                            입력하신 정보
                        </h2>
                        <X className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <SummaryItem icon={Target} label="직종" value={job || "컨설턴트"} />
                        <SummaryItem icon={Building2} label="회사" value={company || "삼성전자"} />
                        <SummaryItem icon={UserRound} label="구분" value={careerType} />
                        <SummaryItem icon={KeyRound} label="키워드" value={keywordSummary} wide />
                    </div>
                    <button
                        type="button"
                        onClick={() => setDetailsOpen((open) => !open)}
                        className="mt-4 flex h-10 w-full items-center justify-center rounded-md border border-[#d7e5ff] bg-white text-sm font-semibold text-[#3778ea]"
                    >
                        {detailsOpen ? "간단히 보기" : "더 자세히 보기"}
                        {detailsOpen ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                    </button>
                    {detailsOpen && (
                        <div className="mt-4 rounded-xl border border-[#e7edff] bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
                            <div>
                                <h3 className="flex items-center gap-2 font-bold text-slate-800">
                                    <BriefcaseBusiness className="h-4 w-4 text-[#8c4b58]" />
                                    주요 업무
                                </h3>
                                <p className="mt-2 pl-6">{mainTask}</p>
                            </div>
                            <div className="mt-5">
                                <h3 className="flex items-center gap-2 font-bold text-slate-800">
                                    <Sparkles className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    경험 사항
                                </h3>
                                <ul className="mt-2 space-y-2 pl-8">
                                    {experienceDetails.map((experience, index) => (
                                        <li key={`${experience}-${index}`} className="flex gap-2">
                                            <span className="text-[#347cff]">-</span>
                                            <span>{experience}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <div className="mt-4 flex items-center gap-2 rounded-md border-l-2 border-blue-500 bg-white px-4 py-4 text-xs font-semibold text-[#347cff] shadow-sm">
                        <Lightbulb className="h-4 w-4 text-amber-400" />
                        이 정보를 바탕으로 AI가 더 정확한 맞춤형 답변을 생성해드려요!
                    </div>
                </section>

                <section className="rounded-[18px] border border-[#d7e5ff] bg-[#fbfcff] p-6 shadow-[0_2px_9px_rgba(28,92,218,0.07)]">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0864ef] text-white">
                                <Lightbulb className="h-4 w-4 fill-amber-300 text-amber-300" />
                            </span>
                            사용 가이드
                        </h2>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setGuideOpen((open) => !open)}
                            className="h-9 rounded border-[#2671ea] bg-white px-4 text-xs font-bold text-[#1760d6] hover:bg-blue-50"
                        >
                            {guideOpen ? "접기" : "펼치기"}
                            {guideOpen ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                        </Button>
                    </div>
                    {guideOpen ? (
                        <div className="grid grid-cols-2 gap-2">
                            {guideItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <div key={item.number} className="rounded-lg border border-[#e8edf8] bg-white px-4 py-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <span className={`flex h-6 w-6 items-center justify-center rounded text-xs text-white ${item.color}`}>
                                                {item.number}
                                            </span>
                                            <Icon className="h-4 w-4 text-[#8a9ab6]" />
                                            {item.title}
                                        </div>
                                        <p className="mt-2 pl-8 text-xs text-slate-400">{item.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-lg border border-[#d7e5ff] bg-[#eef5ff] px-5 py-4 text-sm font-semibold text-[#1760d6]">
                            <span>📝</span>
                            <span>💬</span>
                            <span>✨</span>
                            <span>🎯</span>
                            <span>질문 선택 → 상세 답변 → 초안 생성 → 부분 수정</span>
                        </div>
                    )}
                </section>

                <div className="rounded-md bg-[#f7faff] px-5 py-4 text-xs leading-6 text-slate-500">
                    <span className="mr-1 font-bold text-[#efaa1a]">💡 Pro Tip:</span>
                    <span className="font-semibold text-[#3176e8]">
                        상세질문 답변을 작성하면 훨씬 더 퀄리티 있는 자소서가 생성됩니다!
                    </span>{" "}
                    질문의 &quot;상세 질문 답변하기&quot;를 클릭하여 구체적인 경험과 생각을 입력해보세요.
                    <span className="font-semibold text-[#3176e8]">
                        {" "}텍스트를 드래그하여 선택하면 해당 부분만 다시 생성할 수 있습니다.
                    </span>
                </div>

                {aiNotice && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
                        {aiNotice}
                    </div>
                )}

                {!writingStarted ? (
                    <>
                        <p className="text-center text-base font-semibold text-slate-700">
                            <WandSparkles className="mr-1 inline h-4 w-4 text-orange-400" />
                            첫 번째 자기소개서 항목을 작성해보세요!
                        </p>
                        <div className="text-center text-[#3579f3]">↓</div>
                        <Button
                            type="button"
                            onClick={() => setWritingStarted(true)}
                            className="h-14 w-full rounded-xl bg-[#397df0] text-base font-bold text-white hover:bg-blue-700"
                        >
                            자기소개서 작성 시작하기
                        </Button>
                    </>
                ) : (
                    <section className="space-y-7 rounded-[18px] border border-[#d9e4fa] bg-white p-6 shadow-sm">
                        {items.map((item) => (
                            <div key={item.id} className="space-y-4">
                                <div className="relative rounded-xl border border-[#d7e5ff] bg-[#f2f7ff] p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#347cff] text-sm font-bold text-white">
                                            {item.id}
                                        </span>
                                        <input
                                            value={item.question}
                                            onChange={(event) => updateItem(item.id, { question: event.target.value })}
                                            placeholder="자기소개서 질문을 입력하세요."
                                            className="h-11 flex-1 rounded-lg border border-[#d7e5ff] bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setQuestionMenuItemId(questionMenuItemId === item.id ? null : item.id)
                                            }
                                            className="h-11 w-11 border-[#d7e5ff] bg-white text-[#347cff]"
                                        >
                                            {questionMenuItemId === item.id ? <ChevronUp /> : <ChevronDown />}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeItem(item.id)}
                                            className="h-11 border-rose-100 bg-white px-4 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />
                                            삭제
                                        </Button>
                                    </div>
                                    {questionMenuItemId === item.id && (
                                        <div className="absolute right-[86px] top-[62px] z-20 w-[330px] rounded-lg border border-[#347cff] bg-white shadow-xl">
                                            <p className="border-b bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
                                                사용 가능한 질문들 (8개)
                                            </p>
                                            <div className="max-h-[295px] overflow-y-auto py-1">
                                                {availableQuestions.map((question) => (
                                                    <button
                                                        key={question}
                                                        type="button"
                                                        onClick={() => chooseQuestion(item.id, question)}
                                                        className="block w-full px-5 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        🖊️ {question}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => openDraftPreview(item.id)}
                                        disabled={!item.question}
                                        className="h-12 rounded-xl bg-[#397df0] px-6 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        자기소개서 생성하기
                                    </Button>
                                    {item.question && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setDetailItemId(item.id)}
                                            className="h-12 rounded-xl border-[#d7e5ff] bg-white px-5 text-sm font-semibold text-[#347cff]"
                                        >
                                            📝 상세 질문 답변하기
                                            <span className="ml-2 text-xs">({item.details.filter(Boolean).length}/3)</span>
                                        </Button>
                                    )}
                                </div>

                                <div className="rounded-lg border border-[#d7e5ff] bg-[#f4f8ff] p-4">
                                    <div className="mb-4 flex items-center justify-between rounded-lg border border-[#d7e5ff] px-4 py-4 text-sm">
                                        <span className="rounded-full bg-white px-4 py-2 font-semibold text-[#347cff]">
                                            {item.answer.length} 글자
                                        </span>
                                        <span className="text-slate-500">공백 미포함 {item.answer.replace(/\s/g, "").length}자</span>
                                    </div>
                                    <div className="relative mb-4 flex justify-between rounded-lg border border-[#d7e5ff] bg-white p-3">
                                        <div className="flex gap-2 text-slate-300">
                                            <Button disabled variant="outline" className="h-10 w-10 px-0"><Undo2 /></Button>
                                            <Button disabled variant="outline" className="h-10 w-10 px-0"><RotateCcw /></Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setPolishItemId(polishItemId === item.id ? null : item.id)
                                                    setLengthItemId(null)
                                                }}
                                                className="h-10 border-[#347cff] px-4 text-[#347cff]"
                                            >
                                                ✨ 글 다듬기 <ChevronDown className="ml-1" />
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setLengthItemId(lengthItemId === item.id ? null : item.id)
                                                    setPolishItemId(null)
                                                }}
                                                className="h-10 bg-[#397df0] px-4 text-white hover:bg-blue-700"
                                            >
                                                📏 분량 조절 {lengthItemId === item.id ? <ChevronUp className="ml-1" /> : <ChevronDown className="ml-1" />}
                                            </Button>
                                            <Button variant="outline" className="h-10 border-[#d7e5ff] text-[#347cff]">
                                                <Copy className="mr-1" /> 복사
                                            </Button>
                                        </div>
                                        {polishItemId === item.id && (
                                            <div className="absolute right-[180px] top-[58px] z-10 w-[270px] rounded-xl border border-[#d7e5ff] bg-white py-2 shadow-xl">
                                                {polishOptions.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => openPolishModal(item.id, option.id)}
                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-blue-50"
                                                    >
                                                        <span className="text-base">{option.icon}</span>
                                                        <span className="shrink-0 text-sm font-bold text-slate-800">{option.title}</span>
                                                        <span className="ml-auto truncate text-[11px] text-slate-400">{option.description}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {lengthItemId === item.id && (
                                            <div className="absolute right-[70px] top-[58px] z-10 w-[270px] rounded-xl border border-[#d7e5ff] bg-white p-3 shadow-xl">
                                                {[
                                                    ["살짝 줄이기", "-20%"],
                                                    ["중간 줄이기", "-30%"],
                                                    ["살짝 늘리기", "+20%"],
                                                    ["중간 늘리기", "+50%"],
                                                    ["많이 늘리기", "+80%"],
                                                ].map(([label, ratio]) => (
                                                    <button key={label} type="button" className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50">
                                                        <span>{label}</span>
                                                        <span className="rounded bg-blue-50 px-2 py-1 text-xs text-[#347cff]">{ratio}</span>
                                                    </button>
                                                ))}
                                                <div className="mt-2 border-t pt-3 text-sm">
                                                    <p className="mb-3 font-bold text-[#347cff]">⚙ 직접 설정</p>
                                                    <label className="block text-slate-600">🎯 목표 글자수 <span className="text-xs">(현재: {item.answer.length}자)</span></label>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <input value={targetLength} onChange={(event) => setTargetLength(event.target.value)} className="w-20 rounded border px-2 py-2" />
                                                        <span>글자</span>
                                                        <Button variant="outline" className="h-9">맞추기</Button>
                                                    </div>
                                                    <label className="mt-4 block border-t pt-3 text-slate-600">📊 퍼센트 조절</label>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <input value={percentChange} onChange={(event) => setPercentChange(event.target.value)} className="w-16 rounded border px-2 py-2" />
                                                        <span>% 늘리기</span>
                                                        <Button variant="outline" className="h-9">적용</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Textarea
                                        value={item.answer}
                                        onChange={(event) => updateItem(item.id, { answer: event.target.value })}
                                        placeholder="자기소개서 내용이 여기에 표시됩니다. '자기소개서 생성하기' 버튼을 클릭하세요."
                                        className="min-h-[190px] resize-y rounded-lg border-[#d7e5ff] bg-white p-5 text-sm leading-7"
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            type="button"
                                            onClick={() => beginGeneration(item.id)}
                                            className="h-12 bg-[#397df0] px-6 text-sm font-bold text-white hover:bg-blue-700"
                                        >
                                            <RotateCcw className="mr-2" /> 자기소개서 재생성
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            onClick={addItem}
                            className="h-16 w-full rounded-xl bg-[#397df0] text-lg font-bold text-white hover:bg-blue-700"
                        >
                            새로운 항목 추가하기
                        </Button>
                    </section>
                )}

                <footer className="flex items-center justify-between pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="h-11 rounded-lg border-slate-200 bg-[#fafafa] px-5 text-sm text-slate-600"
                    >
                        이전
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={completeSave}
                            className="h-11 rounded-lg bg-[#337bf2] px-5 text-sm font-bold text-white hover:bg-blue-700"
                        >
                            저장
                        </Button>
                        <Button
                            type="button"
                            onClick={saveDraft}
                            className="h-11 rounded-lg bg-[#337bf2] px-5 text-sm font-bold text-white hover:bg-blue-700"
                        >
                            임시저장
                        </Button>
                    </div>
                </footer>
            </div>

            {detailItem && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-5">
                    <div className="max-h-[calc(100vh-32px)] w-full max-w-[660px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between px-7 pb-4 pt-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">상세 질문 답변하기</h2>
                                <p className="mt-2 text-sm text-slate-700">&quot;{detailItem.question}&quot;</p>
                            </div>
                            <button
                                type="button"
                                aria-label="상세 질문 닫기"
                                onClick={() => setDetailItemId(null)}
                                className="text-slate-400"
                            >
                                <X />
                            </button>
                        </div>
                        <div className="mx-7 rounded-lg border-l-2 border-blue-500 bg-[#eff6ff] px-5 py-4 text-xs text-[#347cff]">
                            💡 <strong>상세답변을 작성할수록 더 구체적이고 퀄리티 있는 자소서가 생성됩니다!</strong>
                            <p className="mt-1 text-slate-500">물론 답변하지 않더라도 건너뛰고 바로 생성하셔도 됩니다.</p>
                        </div>
                        <div className="mt-5 space-y-5 border-y px-7 py-5">
                            {getDetailPrompts(detailItem.question).map((prompt, index) => (
                                <div key={prompt}>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">{index + 1}. {prompt}</label>
                                    <div className="flex gap-3">
                                        <Textarea
                                            value={detailItem.details[index]}
                                            onChange={(event) => updateDetail(index, event.target.value)}
                                            placeholder="답변을 입력하세요..."
                                            className="min-h-[78px] flex-1 bg-[#f7f9ff] p-4"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={detailGeneratingIndex !== null}
                                            onClick={() => generateDetail(index)}
                                            className="h-11 border-[#347cff] text-[#347cff]"
                                        >
                                            {detailGeneratingIndex === index ? (
                                                <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                                            ) : (
                                                "🤖"
                                            )}
                                            {detailGeneratingIndex === index ? " 생성 중" : detailItem.details[index] ? " 재생성" : " AI 생성"}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 px-7 py-4">
                            <Button variant="outline" onClick={() => setDetailItemId(null)} className="h-11 bg-slate-50 px-6 text-slate-500">취소</Button>
                            <Button variant="outline" onClick={() => setDetailItemId(null)} className="h-11 border-[#d7e5ff] px-6 text-[#347cff]">답변만 저장</Button>
                            <Button onClick={() => beginGeneration(detailItem.id)} className="h-11 bg-[#397df0] px-6 text-white hover:bg-blue-700">자기소개서 바로 생성</Button>
                        </div>
                    </div>
                </div>
            )}

            {draftItem && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-5">
                    <div className="max-h-[92vh] w-full max-w-[540px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-center text-xl font-bold text-[#347cff]">자기소개서 초안 생성</h2>
                        <p className="mt-3 text-sm font-semibold text-slate-800">{draftItem.question}</p>
                        <div className="mt-4 rounded-xl border border-[#d7e5ff] bg-[#f7faff] px-5 py-4">
                            <div className="mb-4 border-b border-[#d7e5ff] pb-3 text-center text-sm font-bold text-[#347cff]">
                                📋 상세 정보
                            </div>
                            <div className="space-y-4">
                                {getDetailPrompts(draftItem.question).map((prompt, index) => {
                                    const detailAnswer = draftItem.details[index]?.trim()

                                    return (
                                        <div
                                            key={prompt}
                                            className="relative rounded-lg border border-[#d7e5ff] bg-white px-4 pb-4 pt-5 text-xs leading-5 text-slate-600 shadow-sm"
                                        >
                                            <span className="absolute -top-3 left-5 rounded-full bg-[#347cff] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                                                Q{index + 1}
                                            </span>
                                            <p className="mb-3 text-sm font-bold text-slate-800">{prompt}</p>
                                            <div className="rounded-md border border-[#d7e5ff] bg-[#f7faff] p-3">
                                                <p className="mb-1 text-[11px] font-bold text-[#347cff]">답변</p>
                                                <p className={detailAnswer ? "text-slate-700" : "text-slate-500"}>
                                                    {detailAnswer || "답변이 입력되지 않았습니다."}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <p className="mt-5 text-center text-sm leading-6 text-slate-600">
                            입력하신 내용을 바탕으로 자기소개서 초안을 작성하시겠습니까?
                        </p>
                        <div className="mt-5 flex justify-center gap-3">
                            <Button variant="outline" onClick={() => setDraftItemId(null)} className="h-11 px-6">취소</Button>
                            <Button onClick={() => beginGeneration(draftItem.id)} className="h-11 bg-[#397df0] px-6 text-white hover:bg-blue-700">네, 작성하기</Button>
                        </div>
                    </div>
                </div>
            )}

            {generatingItemId !== null && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65">
                    <div className="w-[520px] rounded-[28px] bg-white p-10 text-center shadow-2xl">
                        <div className="h-2 overflow-hidden rounded-full bg-blue-50">
                            <div className="h-full w-2/3 rounded-full bg-[#397df0]" />
                        </div>
                        <FilePenLine className="mx-auto mt-10 h-12 w-12 text-rose-300" />
                        <h2 className="mt-6 text-2xl font-bold text-[#347cff]">자기소개서 초안이 생성중입니다</h2>
                        <p className="mt-4 text-base leading-7 text-slate-600">
                            AI가 맞춤형 자기소개서를 작성하고 있어요.
                            <br />
                            초안이라서 시간이 걸리니 다른 페이지로 나가지 말아주세요~
                        </p>
                        <div className="mt-7 rounded-lg border border-[#d7e5ff] bg-[#f7faff] px-4 py-4 text-sm font-semibold text-[#347cff]">
                            💡 잠시 후 생성된 초안을 확인하실 수 있습니다
                        </div>
                        <LoaderCircle className="mx-auto mt-5 h-6 w-6 animate-spin text-[#347cff]" />
                    </div>
                </div>
            )}

            {humanizeItem && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 px-5">
                    <div className="flex max-h-[calc(100vh-30px)] w-full max-w-[610px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
                        <div className="flex items-start justify-between bg-[#2e68e9] px-8 py-6 text-white">
                            <div>
                                <h2 className="text-[22px] font-bold">
                                    {selectedPolishOption.icon} {selectedPolishOption.title}
                                </h2>
                                <p className="mt-2 text-sm font-semibold text-blue-100">
                                    {polishSubtitles[selectedPolishOptionId]}
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label={`${selectedPolishOption.title} 닫기`}
                                onClick={() => setHumanizeItemId(null)}
                                className="rounded-lg border border-white/20 bg-white/10 p-3 text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-8 py-7">
                            <h3 className="mb-5 text-base font-bold text-slate-800">🎯 세부 개선 방향</h3>
                            <div className="space-y-4">
                                {selectedPolishDirections.map((direction) => (
                                    <button
                                        key={direction.id}
                                        type="button"
                                        onClick={() => {
                                            setHumanizeDirection(direction.id)
                                            setHumanizeRequest("")
                                        }}
                                        className={`w-full rounded-2xl border px-6 py-5 text-left shadow-sm transition ${
                                            humanizeDirection === direction.id
                                                ? "border-[#347cff] bg-blue-50 ring-1 ring-[#347cff]"
                                                : "border-slate-100 bg-white hover:border-blue-200"
                                        }`}
                                    >
                                        <span className="block text-sm font-bold text-slate-800">{direction.title}</span>
                                        <span className="mt-2 block text-xs text-slate-400">{direction.description}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="my-7 flex items-center gap-4 text-sm text-slate-400">
                                <span className="h-px flex-1 bg-slate-200" />
                                또는
                                <span className="h-px flex-1 bg-slate-200" />
                            </div>
                            <label className="mb-4 block text-base font-bold text-slate-800">
                                🖊️ 직접 요구사항 작성
                            </label>
                            <Textarea
                                value={humanizeRequest}
                                onChange={(event) => {
                                    setHumanizeRequest(event.target.value)
                                    setHumanizeDirection("")
                                }}
                                placeholder={"원하는 개선 방향을 구체적으로 작성해주세요.\n예: 마케팅 업무 경험을 더 구체적으로 설명하고, 성과 수치를 포함해서 작성해주세요"}
                                className="min-h-[135px] resize-none rounded-2xl border-[#347cff] bg-white px-5 py-5 text-sm leading-7"
                            />
                        </div>
                        <div className="flex justify-end gap-4 border-t bg-white px-8 py-5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setHumanizeItemId(null)}
                                className="h-12 px-7 text-slate-500"
                            >
                                취소
                            </Button>
                            <Button
                                type="button"
                                disabled={polishing || (!humanizeDirection && !humanizeRequest.trim())}
                                onClick={applyHumanize}
                                className="h-12 bg-slate-500 px-7 text-white enabled:bg-[#397df0] enabled:hover:bg-blue-700"
                            >
                                {polishing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {polishing ? "적용 중" : "적용하기"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
