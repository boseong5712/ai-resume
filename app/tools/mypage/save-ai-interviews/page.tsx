"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bot, BriefcaseBusiness, CalendarDays, FileText, MessageCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type ChatMessage = {
    role: "interviewer" | "candidate"
    content: string
}

type InterviewRecord = {
    id: string
    name: string
    job: string
    interviewType: string
    resumeTitle: string
    coverLetterTitle: string
    messages: ChatMessage[]
    createdAt: string
    updatedAt: string
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value))
}

export default function SavedAIInterviewsPage() {
    const router = useRouter()
    const [records, setRecords] = useState<InterviewRecord[]>([])
    const [activeId, setActiveId] = useState("")

    useEffect(() => {
        const timer = window.setTimeout(() => {
            try {
                setRecords(JSON.parse(localStorage.getItem("savedInterviewRecords") || "[]") as InterviewRecord[])
            } catch {
                setRecords([])
            }
        }, 0)

        return () => window.clearTimeout(timer)
    }, [])

    const removeRecord = (id: string) => {
        if (!window.confirm("이 AI 면접 기록을 삭제하시겠습니까?")) return
        const next = records.filter((record) => record.id !== id)
        setRecords(next)
        localStorage.setItem("savedInterviewRecords", JSON.stringify(next))
        if (activeId === id) setActiveId("")
    }

    return (
        <div className="min-h-screen bg-[#f4f8ff] px-6 py-8 text-slate-900">
            <div className="mx-auto max-w-5xl rounded-[28px] border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <button type="button" onClick={() => router.push("/tools/mypage/profile")} className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-[#2f74ff]">
                            <ArrowLeft className="h-4 w-4" /> 돌아가기
                        </button>
                        <h1 className="mt-6 text-3xl font-black">저장된 AI 면접 기록</h1>
                        <p className="mt-2 text-sm text-slate-500">AI 면접관과 연습한 질문과 답변을 다시 확인할 수 있습니다.</p>
                    </div>
                    <Button type="button" onClick={() => router.push("/tools/ai-interviewer")} className="rounded-xl bg-[#2f74ff] font-bold text-white hover:bg-blue-700">
                        새 면접 시작하기
                    </Button>
                </div>

                {records.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-6 py-16 text-center">
                        <Bot className="mx-auto h-12 w-12 text-blue-300" />
                        <p className="mt-4 font-black text-slate-600">저장된 AI 면접 기록이 없습니다.</p>
                        <p className="mt-2 text-sm text-slate-400">AI 면접관에서 면접을 시작하면 문답이 자동으로 저장됩니다.</p>
                    </div>
                ) : (
                    <div className="mt-8 space-y-4">
                        {records.map((record) => {
                            const active = activeId === record.id
                            return (
                                <article key={record.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <BriefcaseBusiness className="h-5 w-5 text-[#2f74ff]" />
                                                <h2 className="text-lg font-black">{record.job}</h2>
                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#2f74ff]">{record.interviewType}</span>
                                            </div>
                                            <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                                <CalendarDays className="h-4 w-4" /> {formatDate(record.updatedAt)}
                                                <MessageCircle className="ml-2 h-4 w-4" /> 문답 {record.messages.length}개
                                            </p>
                                            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {record.resumeTitle}</span>
                                                <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {record.coverLetterTitle}</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" onClick={() => setActiveId(active ? "" : record.id)} className="rounded-xl border-blue-200 font-bold text-[#2f74ff]">
                                                {active ? "접기" : "보기"}
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => removeRecord(record.id)} className="rounded-xl border-red-100 font-bold text-red-500 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {active && (
                                        <div className="space-y-3 border-t border-slate-100 bg-slate-50/70 p-5">
                                            {record.messages.map((message, index) => (
                                                <div key={`${record.id}-${index}`} className={`flex ${message.role === "candidate" ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                                                        message.role === "candidate" ? "bg-[#2f74ff] text-white" : "border border-slate-100 bg-white text-slate-700"
                                                    }`}>
                                                        {message.content}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
