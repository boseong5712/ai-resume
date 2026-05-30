"use client"

import { useEffect, useMemo, useState } from "react"
import {
    ArrowLeft,
    Bot,
    BriefcaseBusiness,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    FileText,
    Keyboard,
    LoaderCircle,
    MessageCircle,
    RotateCcw,
    Send,
    UserRound,
} from "lucide-react"
import { JOB_DATA } from "@/app/data/jobData"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Stage = "method" | "basic" | "documents" | "interview"

type SavedResume = {
    id: string
    title?: string
    data: Record<string, unknown>
    createdAt?: string
    updatedAt?: string
}

type SavedCoverLetter = {
    id: string
    title: string
    company?: string
    job?: string
    integratedCoverLetter?: string
    items?: Array<{ question?: string; answer?: string }>
    createdAt?: string
    updatedAt?: string
}

type ChatMessage = {
    role: "interviewer" | "candidate"
    content: string
}

type InterviewRecord = {
    id: string
    name: string
    job: string
    interviewType: string
    resumeId: string
    resumeTitle: string
    coverLetterId: string
    coverLetterTitle: string
    messages: ChatMessage[]
    createdAt: string
    updatedAt: string
}

const INTERVIEW_TYPES = [
    { name: "기술 면접", description: "직무 관련 기술적 역량을 평가하는 면접입니다." },
    { name: "인성 면접", description: "인성과 행동 양식을 평가하는 면접입니다." },
    { name: "컬처핏 면접", description: "기업 문화와의 적합성을 평가하는 면접입니다." },
    { name: "일반 면접", description: "기본적인 경력과 역량을 평가하는 면접입니다." },
    { name: "문제 해결 면접", description: "문제 해결 능력을 평가하는 면접입니다." },
    { name: "시나리오 면접", description: "특정 상황에서의 대응 능력을 평가하는 면접입니다." },
    { name: "스트레스 면접", description: "압박 상황에서의 대응 능력을 평가하는 면접입니다." },
    { name: "상황 면접", description: "가상의 상황에서의 대처 방식을 평가하는 면접입니다." },
] as const

const STEPS = [
    { id: "method", label: "면접 방식" },
    { id: "basic", label: "기본 정보" },
    { id: "documents", label: "서류 제출" },
    { id: "interview", label: "면접 진행" },
] as const

function formatDate(value?: string) {
    if (!value) return "저장일 정보 없음"
    return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value))
}

function StepIndicator({ stage }: { stage: Stage }) {
    const activeIndex = STEPS.findIndex((step) => step.id === stage)

    return (
        <div className="mt-8 flex items-start justify-center">
            {STEPS.map((step, index) => {
                const complete = index < activeIndex
                const active = index === activeIndex
                return (
                    <div key={step.id} className="flex items-start">
                        <div className="w-[76px] text-center">
                            <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                                complete ? "bg-emerald-500 text-white" : active ? "bg-[#2f74ff] text-white shadow-lg" : "bg-slate-100 text-slate-300"
                            }`}>
                                {complete ? <Check className="h-4 w-4" /> : index + 1}
                            </span>
                            <span className={`mt-2 block text-xs font-bold ${active ? "text-[#2f74ff]" : complete ? "text-emerald-600" : "text-slate-300"}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && <div className={`mt-4 h-px w-16 ${index < activeIndex ? "bg-emerald-400" : "bg-slate-200"}`} />}
                    </div>
                )
            })}
        </div>
    )
}

export default function AIInterviewerPage() {
    const [stage, setStage] = useState<Stage>("method")
    const [name, setName] = useState("")
    const [job, setJob] = useState("")
    const [interviewType, setInterviewType] = useState("")
    const [jobMenuOpen, setJobMenuOpen] = useState(false)
    const [typeMenuOpen, setTypeMenuOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState("")
    const [resumes, setResumes] = useState<SavedResume[]>([])
    const [coverLetters, setCoverLetters] = useState<SavedCoverLetter[]>([])
    const [selectedResumeId, setSelectedResumeId] = useState("")
    const [selectedCoverLetterId, setSelectedCoverLetterId] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [activeInterviewId, setActiveInterviewId] = useState("")
    const [answer, setAnswer] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const timer = window.setTimeout(() => {
            try {
                setResumes(JSON.parse(localStorage.getItem("savedResumes") || "[]") as SavedResume[])
                setCoverLetters(JSON.parse(localStorage.getItem("savedCoverLetters") || "[]") as SavedCoverLetter[])
            } catch {
                setResumes([])
                setCoverLetters([])
            }
        }, 0)

        return () => window.clearTimeout(timer)
    }, [])

    const selectedResume = useMemo(() => resumes.find((resume) => resume.id === selectedResumeId), [resumes, selectedResumeId])
    const selectedCoverLetter = useMemo(() => coverLetters.find((coverLetter) => coverLetter.id === selectedCoverLetterId), [coverLetters, selectedCoverLetterId])
    const activeJobs = JOB_DATA.find((category) => category.category === activeCategory)?.jobs || []
    const canContinueBasic = Boolean(name.trim() && job && interviewType)
    const canContinueDocuments = Boolean(selectedResumeId && selectedCoverLetterId)

    const profile = {
        name: name.trim(),
        job,
        interviewType,
        resume: selectedResume?.data,
        coverLetter: selectedCoverLetter,
    }

    const persistInterview = (interviewId: string, nextMessages: ChatMessage[]) => {
        const now = new Date().toISOString()
        const current = JSON.parse(localStorage.getItem("savedInterviewRecords") || "[]") as InterviewRecord[]
        const existing = current.find((record) => record.id === interviewId)
        const record: InterviewRecord = {
            id: interviewId,
            name: name.trim(),
            job,
            interviewType,
            resumeId: selectedResumeId,
            resumeTitle: selectedResume?.title || String(selectedResume?.data.name || "제목 없는 이력서"),
            coverLetterId: selectedCoverLetterId,
            coverLetterTitle: selectedCoverLetter?.title || "제목 없는 자기소개서",
            messages: nextMessages,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
        }
        const next = existing
            ? current.map((item) => (item.id === interviewId ? record : item))
            : [record, ...current]
        localStorage.setItem("savedInterviewRecords", JSON.stringify(next))
    }

    const requestQuestion = async (action: "start" | "answer", nextHistory: ChatMessage[], nextAnswer = "", interviewId = activeInterviewId) => {
        setLoading(true)
        setError("")
        if (interviewId) persistInterview(interviewId, nextHistory)
        try {
            const response = await fetch("/api/ai-interviewer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, profile, history: nextHistory, answer: nextAnswer }),
            })
            const data = (await response.json()) as { text?: string; error?: string }
            if (!response.ok || !data.text) throw new Error(data.error || "면접 질문을 생성하지 못했습니다.")
            const nextMessages: ChatMessage[] = [...nextHistory, { role: "interviewer", content: data.text }]
            setMessages(nextMessages)
            if (interviewId) persistInterview(interviewId, nextMessages)
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "면접 질문을 생성하지 못했습니다.")
        } finally {
            setLoading(false)
        }
    }

    const startInterview = () => {
        const interviewId = crypto.randomUUID()
        setActiveInterviewId(interviewId)
        setStage("interview")
        setMessages([])
        void requestQuestion("start", [], "", interviewId)
    }

    const submitAnswer = () => {
        const trimmed = answer.trim()
        if (!trimmed || loading) return
        const nextHistory: ChatMessage[] = [...messages, { role: "candidate", content: trimmed }]
        setMessages(nextHistory)
        setAnswer("")
        void requestQuestion("answer", nextHistory, trimmed)
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e9f1ff_0,#f5f8ff_52%,#f8fbff_100%)] px-5 py-8 text-slate-900">
            <div className="mx-auto w-full max-w-[760px] rounded-[28px] border border-blue-100 bg-white px-7 py-8 shadow-[0_24px_65px_rgba(39,91,180,0.15)] md:px-10">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2365dd] text-white shadow-lg">
                        <Bot className="h-8 w-8" />
                    </div>
                    <h1 className="mt-5 text-4xl font-black tracking-tight text-[#2f74ff]">AI 면접관</h1>
                    <p className="mt-2 text-base text-slate-500">AI가 당신의 면접을 도와드립니다</p>
                </div>

                <StepIndicator stage={stage} />

                {stage === "method" && (
                    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-7">
                        <div className="text-center">
                            <h2 className="text-3xl font-black">면접 방식 선택</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500">실전과 같은 텍스트 문답으로 면접을 연습해보세요.</p>
                        </div>
                        <button type="button" onClick={() => setStage("basic")} className="mx-auto mt-8 block w-full max-w-[360px] rounded-2xl border border-blue-100 bg-white p-7 text-left shadow-md transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2f74ff]">
                                <Keyboard className="h-7 w-7" />
                            </span>
                            <span className="mt-5 block text-xl font-black">텍스트 모의면접</span>
                            <span className="mt-3 block text-sm leading-6 text-slate-500">텍스트로 질문과 답변을 주고받는 면접을 진행합니다. 답변을 신중하게 작성할 수 있습니다.</span>
                            <span className="mt-6 block text-sm font-bold text-[#2f74ff]">텍스트 답변 · 답변 수정 가능 · 시간 제한 없음</span>
                        </button>
                        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4 text-sm leading-6 text-slate-600">
                            <span className="mr-2">💡</span>
                            면접 답변을 차분히 정리하며 연습하고 싶다면 텍스트 모의면접을 선택하세요.
                        </div>
                    </section>
                )}

                {stage === "basic" && (
                    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-7">
                        <div className="space-y-5">
                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-sm font-black"><UserRound className="h-4 w-4 text-[#2f74ff]" /> 이름</span>
                                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름을 입력하세요" className="h-12 rounded-xl bg-white" />
                            </label>

                            <div className="relative">
                                <span className="mb-2 flex items-center gap-2 text-sm font-black"><BriefcaseBusiness className="h-4 w-4 text-[#2f74ff]" /> 관심 직무</span>
                                <button type="button" onClick={() => { setJobMenuOpen((open) => !open); setTypeMenuOpen(false) }} className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-bold text-slate-600">
                                    {job || "직무를 선택하세요"}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {jobMenuOpen && (
                                    <div className="absolute z-20 mt-2 max-h-[300px] w-full overflow-y-auto rounded-xl border border-[#2f74ff] bg-white shadow-xl">
                                        {activeCategory ? (
                                            <>
                                                <button type="button" onClick={() => setActiveCategory("")} className="flex w-full items-center gap-2 border-b border-slate-100 px-4 py-3 text-left text-sm font-black text-slate-700">
                                                    <ChevronLeft className="h-4 w-4" /> {activeCategory}
                                                </button>
                                                {activeJobs.map((item) => (
                                                    <button key={item.name} type="button" onClick={() => { setJob(item.name); setJobMenuOpen(false); setActiveCategory("") }} className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50">
                                                        {item.name}
                                                    </button>
                                                ))}
                                            </>
                                        ) : JOB_DATA.map((category) => (
                                            <button key={category.category} type="button" onClick={() => setActiveCategory(category.category)} className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left hover:bg-blue-50">
                                                <span>
                                                    <span className="mr-2">{category.icon}</span>
                                                    <span className="text-sm font-black text-slate-800">{category.category}</span>
                                                    <span className="ml-2 text-xs text-slate-400">{category.jobs.length}개의 직무</span>
                                                </span>
                                                <ChevronDown className="h-4 w-4 -rotate-90 text-slate-400" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <span className="mb-2 flex items-center gap-2 text-sm font-black"><MessageCircle className="h-4 w-4 text-[#2f74ff]" /> 면접 유형</span>
                                <button type="button" onClick={() => { setTypeMenuOpen((open) => !open); setJobMenuOpen(false) }} className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-bold text-slate-600">
                                    {interviewType || "면접 유형을 선택하세요"}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {typeMenuOpen && (
                                    <div className="absolute z-20 mt-2 max-h-[300px] w-full overflow-y-auto rounded-xl border border-[#2f74ff] bg-white shadow-xl">
                                        {INTERVIEW_TYPES.map((type) => (
                                            <button key={type.name} type="button" onClick={() => { setInterviewType(type.name); setTypeMenuOpen(false) }} className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-blue-50">
                                                <span className="block text-sm font-black text-slate-800">{type.name}</span>
                                                <span className="mt-1 block text-xs text-slate-500">{type.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <Button type="button" variant="outline" onClick={() => setStage("method")} className="h-12 rounded-xl border-blue-300 font-bold text-[#2f74ff]">이전</Button>
                            <Button type="button" disabled={!canContinueBasic} onClick={() => setStage("documents")} className="h-12 rounded-xl bg-[#2f74ff] font-bold text-white">다음</Button>
                        </div>
                    </section>
                )}

                {stage === "documents" && (
                    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-7">
                        <p className="text-center text-base font-bold text-[#2f74ff]">면접에 사용할 이력서와 자기소개서를 선택해주세요.</p>
                        <div className="mt-7 grid gap-5 md:grid-cols-2">
                            <DocumentColumn title="이력서 선택" icon={<FileText className="h-5 w-5" />}>
                                {resumes.length ? resumes.map((resume) => (
                                    <DocumentCard key={resume.id} active={selectedResumeId === resume.id} title={resume.title || resume.data.name as string || "제목 없는 이력서"} date={formatDate(resume.updatedAt || resume.createdAt)} onClick={() => setSelectedResumeId(resume.id)} />
                                )) : <EmptyDocument text="저장된 이력서가 없습니다." />}
                            </DocumentColumn>
                            <DocumentColumn title="자기소개서 선택" icon={<FileText className="h-5 w-5" />}>
                                {coverLetters.length ? coverLetters.map((coverLetter) => (
                                    <DocumentCard key={coverLetter.id} active={selectedCoverLetterId === coverLetter.id} title={coverLetter.title || "제목 없는 자기소개서"} date={formatDate(coverLetter.updatedAt || coverLetter.createdAt)} onClick={() => setSelectedCoverLetterId(coverLetter.id)} />
                                )) : <EmptyDocument text="저장된 자기소개서가 없습니다." />}
                            </DocumentColumn>
                        </div>
                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <Button type="button" variant="outline" onClick={() => setStage("basic")} className="h-12 rounded-xl border-blue-200 font-bold text-slate-600">이전</Button>
                            <Button type="button" disabled={!canContinueDocuments || loading} onClick={startInterview} className="h-12 rounded-xl bg-[#2f74ff] font-bold text-white">다음</Button>
                        </div>
                    </section>
                )}

                {stage === "interview" && (
                    <section className="mt-8">
                        <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4">
                            <div>
                                <p className="text-sm font-black text-[#2f74ff]">{job}</p>
                                <p className="mt-1 text-xs text-slate-500">{interviewType} · {name} 지원자</p>
                            </div>
                            <Button type="button" variant="outline" onClick={() => setStage("documents")} className="rounded-xl border-blue-200 bg-white text-xs font-bold text-[#2f74ff]">
                                <ArrowLeft className="mr-1 h-4 w-4" /> 서류 다시 선택
                            </Button>
                        </div>
                        <div className="mt-4 min-h-[390px] space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                            {messages.map((message, index) => (
                                <div key={`${message.role}-${index}`} className={`flex ${message.role === "candidate" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                        message.role === "candidate" ? "bg-[#2f74ff] text-white" : "border border-slate-100 bg-white text-slate-700"
                                    }`}>
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                    <LoaderCircle className="h-4 w-4 animate-spin" /> 면접관이 다음 질문을 준비하고 있습니다.
                                </div>
                            )}
                            {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</p>}
                        </div>
                        <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
                            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitAnswer() } }} placeholder="면접 답변을 입력하세요. Shift + Enter로 줄을 바꿀 수 있습니다." className="min-h-[110px] w-full resize-none px-2 py-2 text-sm leading-6 outline-none" />
                            <div className="flex items-center justify-between">
                                <Button type="button" variant="ghost" onClick={() => {
                                    const interviewId = crypto.randomUUID()
                                    setActiveInterviewId(interviewId)
                                    setMessages([])
                                    void requestQuestion("start", [], "", interviewId)
                                }} disabled={loading} className="text-xs font-bold text-slate-500">
                                    <RotateCcw className="mr-1 h-4 w-4" /> 처음부터 다시
                                </Button>
                                <Button type="button" onClick={submitAnswer} disabled={!answer.trim() || loading} className="rounded-xl bg-[#2f74ff] font-bold text-white">
                                    <Send className="mr-2 h-4 w-4" /> 답변 보내기
                                </Button>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

function DocumentColumn({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 border-l-4 border-[#2f74ff] pl-2 text-lg font-black text-[#1764ff]">{icon}{title}</h3>
            <div className="mt-4 space-y-3">{children}</div>
        </div>
    )
}

function DocumentCard({ active, title, date, onClick }: { active: boolean; title: string; date: string; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className={`w-full rounded-xl border p-4 text-left transition ${active ? "border-[#2f74ff] bg-blue-50 shadow-sm" : "border-slate-100 bg-white hover:border-blue-200"}`}>
            <span className="flex items-start justify-between gap-2">
                <span className="font-black text-slate-800">{title}</span>
                {active && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2f74ff]" />}
            </span>
            <span className="mt-2 block text-xs text-slate-400">{date}</span>
        </button>
    )
}

function EmptyDocument({ text }: { text: string }) {
    return <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm font-bold text-slate-400">{text}</div>
}
