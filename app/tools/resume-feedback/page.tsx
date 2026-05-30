"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Award, Bot, BriefcaseBusiness, Check, FileText, GraduationCap, Lightbulb, Save, Sparkles, Target, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"

type SavedResume = {
    id: string
    title: string
    data: Record<string, unknown>
    createdAt: string
    updatedAt: string
    isMain?: boolean
}

type ResumeSectionFeedback = {
    section: string
    score: number
    level: "excellent" | "good" | "needsWork"
    summary: string
    strengths: string[]
    improvements: string[]
}

type FeedbackCard = {
    section: string
    field?: string
    title: string
    issue?: string
    suggestion: string
    importance?: "매우 중요" | "중요" | "보통" | "참고사항"
}

type ResumeFeedbackResult = {
    totalScore: number
    verdict: string
    sections: ResumeSectionFeedback[]
    strengths: string[]
    improvements: string[]
    strengthCards?: FeedbackCard[]
    improvementCards?: FeedbackCard[]
    detailedFeedback: Array<{
        section: string
        field?: string
        current: string
        issue: string
        suggestion: string
    }>
}

type SavedResumeFeedback = {
    id: string
    resumeId: string
    resumeTitle: string
    result: ResumeFeedbackResult
    createdAt: string
}

const sectionIcons: Record<string, typeof FileText> = {
    기본정보: FileText,
    학력사항: GraduationCap,
    경력사항: BriefcaseBusiness,
    보유기술: Wrench,
    자격증: Target,
    수상경력: Award,
}

function getDateText(date: string) {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return "날짜 없음"
    return parsed.toLocaleDateString("ko-KR", { year: "numeric", month: "numeric", day: "numeric" })
}

function getScoreStyle(score: number) {
    if (score >= 70) return { text: "text-blue-600", border: "border-blue-500", bar: "bg-blue-500", chip: "bg-blue-50 text-blue-600", label: "강점" }
    if (score >= 45) return { text: "text-amber-500", border: "border-amber-400", bar: "bg-amber-400", chip: "bg-amber-50 text-amber-600", label: "보통" }
    return { text: "text-rose-500", border: "border-rose-400", bar: "bg-rose-500", chip: "bg-rose-50 text-rose-600", label: "개선필요" }
}

function getImportanceClass(importance?: FeedbackCard["importance"]) {
    if (importance === "매우 중요") return "bg-rose-100 text-rose-600"
    if (importance === "중요") return "bg-orange-100 text-orange-600"
    if (importance === "보통") return "bg-amber-100 text-amber-600"
    return "bg-emerald-100 text-emerald-600"
}

export default function ResumeFeedbackPage() {
    const router = useRouter()
    const [resumes, setResumes] = useState<SavedResume[]>([])
    const [mounted, setMounted] = useState(false)
    const [selectedResumeId, setSelectedResumeId] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisStep, setAnalysisStep] = useState(0)
    const [result, setResult] = useState<ResumeFeedbackResult | null>(null)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setResumes(JSON.parse(localStorage.getItem("savedResumes") || "[]") as SavedResume[])
            setMounted(true)
        }, 0)
        return () => window.clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!isAnalyzing) return
        const timer = window.setInterval(() => {
            setAnalysisStep((step) => Math.min(2, step + 1))
        }, 900)
        return () => window.clearInterval(timer)
    }, [isAnalyzing])

    const selectedResume = useMemo(() => resumes.find((resume) => resume.id === selectedResumeId) || null, [resumes, selectedResumeId])

    const handleGenerate = async () => {
        if (!selectedResume) return
        setIsAnalyzing(true)
        setAnalysisStep(0)
        setResult(null)
        setSaved(false)

        try {
            const response = await fetch("/api/resume-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resume: selectedResume.data }),
            })
            const data = (await response.json()) as { result?: ResumeFeedbackResult }
            if (data.result) setResult(data.result)
        } catch {
            alert("이력서 피드백 생성 중 문제가 발생했습니다.")
        } finally {
            window.setTimeout(() => {
                setIsAnalyzing(false)
                setAnalysisStep(2)
            }, 700)
        }
    }

    const handleSaveFeedback = () => {
        if (!selectedResume || !result) return
        const stored = JSON.parse(localStorage.getItem("savedResumeFeedbacks") || "[]") as SavedResumeFeedback[]
        const feedback: SavedResumeFeedback = {
            id: crypto.randomUUID(),
            resumeId: selectedResume.id,
            resumeTitle: selectedResume.title,
            result,
            createdAt: new Date().toISOString(),
        }

        localStorage.setItem("savedResumeFeedbacks", JSON.stringify([feedback, ...stored]))
        setSaved(true)
    }

    if (isAnalyzing) {
        const progress = [35, 65, 90][analysisStep] || 50
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#6379ed] to-[#7c4ab0] px-6 py-16">
                <div className="w-full max-w-[560px] rounded-[28px] bg-white p-10 text-center shadow-2xl">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-50">
                        <Bot className="h-9 w-9 animate-pulse text-violet-600" />
                    </div>
                    <h1 className="mt-8 text-3xl font-black text-violet-600">AI가 이력서를 분석하고 있습니다</h1>
                    <p className="mt-3 text-sm text-slate-500">이력서 생성기에서 수정 가능한 항목만 점검하고 있어요</p>

                    <div className="mt-9 text-left">
                        <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
                            <span>분석 진행률</span>
                            <span className="text-violet-600">{progress}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-violet-600 transition-all duration-700" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <div className="mt-7 space-y-3 text-left">
                        {["입력값 분석", "수정 가능한 항목 추출", "AI 피드백 생성"].map((label, index) => (
                            <div key={label} className={`flex items-center gap-4 rounded-xl border p-4 ${analysisStep > index ? "bg-emerald-50" : analysisStep === index ? "border-violet-300 bg-violet-50" : "bg-white text-slate-400"}`}>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${analysisStep > index ? "bg-emerald-500 text-white" : "bg-slate-100 text-violet-600"}`}>
                                    {analysisStep > index ? <Check className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                                </span>
                                <span className="font-extrabold">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
            <div className="mx-auto max-w-[760px] space-y-6">
                <section className="rounded-2xl border bg-white p-8 shadow-sm">
                    <h1 className="text-4xl font-black">이력서 피드백</h1>
                    <p className="mt-3 text-base text-slate-600">AI가 이력서 생성기에서 실제로 수정할 수 있는 입력칸만 기준으로 피드백해드립니다.</p>
                </section>

                {!result ? (
                    <section className="rounded-2xl border bg-white p-8 shadow-sm">
                        <h2 className="text-3xl font-black">이력서 선택</h2>
                        <p className="mt-3 text-slate-600">피드백을 받을 완성된 이력서를 선택해주세요.</p>

                        <div className="my-8 flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-sm text-slate-500">완성된 이력서</span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-2xl font-semibold">완성된 이력서</h3>
                            <Button type="button" variant="outline" onClick={() => router.push("/tools/resume-builder")}>
                                이력서 작성하기
                            </Button>
                        </div>

                        {!mounted ? (
                            <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">저장된 이력서를 불러오는 중입니다.</div>
                        ) : resumes.length === 0 ? (
                            <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">저장된 이력서가 없습니다.</div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {resumes.map((resume) => {
                                    const active = selectedResumeId === resume.id
                                    return (
                                        <button
                                            key={resume.id}
                                            type="button"
                                            onClick={() => setSelectedResumeId(resume.id)}
                                            className={`flex items-center gap-4 rounded-2xl border bg-white p-5 text-left shadow-sm transition ${active ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "hover:border-blue-300"}`}
                                        >
                                            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${active ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                                                <FileText className="h-6 w-6" />
                                            </span>
                                            <span>
                                                <span className="block text-lg font-black">{resume.title || "제목 없는 이력서"}</span>
                                                <span className="mt-1 block text-sm text-slate-500">작성자: {(resume.data?.name as string) || "익명"}</span>
                                                <span className="mt-1 block text-sm text-slate-500">최종 수정: {getDateText(resume.updatedAt)}</span>
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {selectedResume && (
                            <div className="mt-8 text-center">
                                <Button type="button" onClick={handleGenerate} className="h-12 rounded-xl bg-blue-600 px-8 text-base font-extrabold text-white hover:bg-blue-700">
                                    <Bot className="mr-2 h-5 w-5" />
                                    피드백 생성하기
                                </Button>
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="space-y-6">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <div className="rounded-2xl bg-gradient-to-br from-[#6578e8] to-[#7b48ab] p-10 text-center text-white">
                                <Target className="mx-auto h-10 w-10" />
                                <p className="mt-4 text-sm font-bold text-white/80">전체 평가 점수</p>
                                <div className="mt-2 text-6xl font-black">{result.totalScore}<span className="text-2xl">/100</span></div>
                                <p className="mt-4 rounded-full bg-white/15 px-4 py-2 text-sm font-bold">{result.verdict}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-xl font-black">섹션별 점수</h2>
                            <div className="space-y-4">
                                {result.sections.map((section) => {
                                    const style = getScoreStyle(section.score)
                                    const Icon = sectionIcons[section.section] || FileText
                                    return (
                                        <div key={section.section} className={`rounded-2xl border p-5 ${style.border}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`h-5 w-5 ${style.text}`} />
                                                    <h3 className="font-black">{section.section}</h3>
                                                </div>
                                                <span className={`rounded-full px-3 py-1 text-sm font-black ${style.chip}`}>{section.score}점 · {style.label}</span>
                                            </div>
                                            <div className="mt-4 h-2 rounded-full bg-slate-100">
                                                <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${section.score}%` }} />
                                            </div>
                                            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{section.summary}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <FeedbackCardList title="강점" cards={result.strengthCards?.length ? result.strengthCards : result.strengths.map((item) => ({ section: "강점", title: item, suggestion: item, importance: "참고사항" as const }))} tone="green" />
                        <FeedbackCardList title="개선점" cards={result.improvementCards?.length ? result.improvementCards : result.improvements.map((item) => ({ section: "개선점", title: item, issue: item, suggestion: item, importance: "중요" as const }))} tone="red" />

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-xl font-black">상세 피드백</h2>
                            <div className="space-y-4">
                                {result.detailedFeedback.map((item, index) => (
                                    <div key={`${item.section}-${item.field || index}`} className="rounded-2xl border border-blue-400 bg-blue-50/30 p-5">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-black text-blue-700">{item.section}</h3>
                                            {item.field && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600">{item.field}</span>}
                                        </div>
                                        <div className="space-y-3 text-sm leading-6">
                                            <p className="rounded-xl border bg-white p-4"><b>원본 내용</b><br />{item.current}</p>
                                            <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700"><b>피드백</b><br />{item.issue}</p>
                                            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700"><b>개선 제안</b><br />{item.suggestion}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center gap-3">
                            <Button type="button" variant="outline" onClick={() => {
                                setResult(null)
                                setSaved(false)
                            }}>
                                다시 선택
                            </Button>
                            <Button type="button" onClick={handleSaveFeedback} disabled={saved} className="bg-blue-600 text-white hover:bg-blue-700">
                                {saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                {saved ? "저장 완료" : "피드백 저장하기"}
                            </Button>
                            {saved && (
                                <Link href="/tools/mypage/save-resume-feedback">
                                    <Button type="button" variant="outline">저장된 피드백 보기</Button>
                                </Link>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

function FeedbackCardList({ title, cards, tone }: { title: string; cards: FeedbackCard[]; tone: "green" | "red" }) {
    const positive = tone === "green"
    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className={`mb-5 flex items-center gap-2 text-xl font-black ${positive ? "text-emerald-700" : "text-rose-700"}`}>
                {positive ? <Lightbulb className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                {title}
            </h2>
            <div className="space-y-4">
                {cards.map((card, index) => (
                    <div key={`${card.section}-${card.field || card.title}-${index}`} className={`rounded-2xl border p-5 ${positive ? "border-emerald-400 bg-emerald-50/20" : "border-rose-400 bg-rose-50/20"}`}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="font-black">{card.section}</h3>
                                <p className="mt-1 text-sm font-semibold text-slate-700">{card.field ? `${card.field}: ` : ""}{card.title}</p>
                            </div>
                            {card.importance && <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${getImportanceClass(card.importance)}`}>{card.importance}</span>}
                        </div>
                        {card.issue && <p className="rounded-xl bg-rose-50 p-3 text-sm leading-6 text-rose-700">문제점: {card.issue}</p>}
                        <p className={`mt-3 rounded-xl p-3 text-sm leading-6 ${positive ? "bg-emerald-50 text-emerald-700" : "bg-emerald-50 text-emerald-700"}`}>개선방법: {card.suggestion}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
