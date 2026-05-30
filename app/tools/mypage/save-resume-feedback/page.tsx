"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type ResumeSectionFeedback = {
    section: string
    score: number
    level: "excellent" | "good" | "needsWork"
    summary: string
    strengths: string[]
    improvements: string[]
}

type ResumeFeedbackResult = {
    totalScore: number
    verdict: string
    sections: ResumeSectionFeedback[]
    strengths: string[]
    improvements: string[]
    detailedFeedback: Array<{
        section: string
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

function getDateText(date: string) {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return "날짜 없음"
    return parsed.toLocaleDateString("ko-KR", { year: "numeric", month: "numeric", day: "numeric" })
}

function getScoreColor(score: number) {
    if (score >= 70) return "text-blue-600"
    if (score >= 45) return "text-amber-500"
    return "text-rose-500"
}

export default function SavedResumeFeedbackPage() {
    const router = useRouter()
    const [feedbacks, setFeedbacks] = useState<SavedResumeFeedback[]>([])
    const [mounted, setMounted] = useState(false)
    const [selected, setSelected] = useState<SavedResumeFeedback | null>(null)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setFeedbacks(JSON.parse(localStorage.getItem("savedResumeFeedbacks") || "[]") as SavedResumeFeedback[])
            setMounted(true)
        }, 0)
        return () => window.clearTimeout(timer)
    }, [])

    const saveFeedbacks = (next: SavedResumeFeedback[]) => {
        localStorage.setItem("savedResumeFeedbacks", JSON.stringify(next))
        setFeedbacks(next)
        if (selected && !next.some((item) => item.id === selected.id)) setSelected(null)
    }

    const handleDelete = (id: string) => {
        if (!window.confirm("저장된 이력서 피드백을 삭제할까요?")) return
        saveFeedbacks(feedbacks.filter((item) => item.id !== id))
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
            <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-10 shadow-sm">
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <button type="button" onClick={() => router.push("/tools/mypage/profile")} className="mb-8 flex items-center gap-2 text-sm text-slate-500">
                            <ArrowLeft className="h-4 w-4" />
                            돌아가기
                        </button>

                        <h1 className="text-3xl font-black">저장된 이력서 피드백</h1>
                        <p className="mt-2 text-sm text-slate-500">AI가 분석한 이력서 피드백 결과를 확인하고 관리할 수 있습니다.</p>
                    </div>

                    <Button type="button" onClick={() => router.push("/tools/resume-feedback")} className="bg-blue-600 text-white hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        새 피드백 받기
                    </Button>
                </div>

                {!mounted ? (
                    <div className="rounded-2xl border border-dashed p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-4 font-bold text-slate-500">저장된 이력서 피드백을 불러오는 중입니다.</p>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-4 font-bold text-slate-500">저장된 이력서 피드백이 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                        {feedbacks.map((feedback) => (
                            <div key={feedback.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-black">{feedback.resumeTitle || "제목 없는 이력서"}</h2>
                                        <p className="mt-3 text-sm text-slate-500">{getDateText(feedback.createdAt)}</p>
                                    </div>
                                    <span className={`rounded-full bg-slate-50 px-3 py-1 text-sm font-black ${getScoreColor(feedback.result.totalScore)}`}>
                                        {feedback.result.totalScore}점
                                    </span>
                                </div>

                                <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-600">{feedback.result.verdict}</p>

                                <div className="mt-6 grid grid-cols-2 gap-2">
                                    <Button type="button" onClick={() => setSelected(feedback)} className="bg-blue-600 text-white hover:bg-blue-700">
                                        보기
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => handleDelete(feedback.id)} className="text-rose-500">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        삭제
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 px-5 py-10">
                    <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-8 shadow-2xl">
                        <div className="flex items-start justify-between gap-5 border-b pb-5">
                            <div>
                                <h2 className="text-2xl font-black">{selected.resumeTitle}</h2>
                                <p className="mt-2 text-sm text-slate-500">저장일: {getDateText(selected.createdAt)}</p>
                            </div>
                            <Button type="button" variant="outline" onClick={() => setSelected(null)}>닫기</Button>
                        </div>

                        <div className="mt-6 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-8 text-center text-white">
                            <p className="text-sm font-bold text-white/80">전체 평가 점수</p>
                            <div className="mt-2 text-5xl font-black">{selected.result.totalScore}<span className="text-xl">/100</span></div>
                            <p className="mt-4 text-sm leading-6">{selected.result.verdict}</p>
                        </div>

                        <div className="mt-6 space-y-4">
                            {selected.result.sections.map((section) => (
                                <div key={section.section} className="rounded-2xl border p-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black">{section.section}</h3>
                                        <span className={`font-black ${getScoreColor(section.score)}`}>{section.score}점</span>
                                    </div>
                                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${section.score}%` }} />
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-slate-600">{section.summary}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 rounded-2xl border bg-slate-50 p-5">
                            <h3 className="font-black">상세 피드백</h3>
                            <div className="mt-4 space-y-3">
                                {selected.result.detailedFeedback.map((item, index) => (
                                    <div key={`${item.section}-${index}`} className="rounded-xl bg-white p-4 text-sm leading-6">
                                        <p className="font-bold text-blue-700">{item.section}</p>
                                        <p className="mt-2"><b>문제점:</b> {item.issue}</p>
                                        <p className="mt-2"><b>개선 제안:</b> {item.suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
