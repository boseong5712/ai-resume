"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { ArrowLeft, Clock3, ExternalLink, LoaderCircle, Lock, LogIn, PanelLeftClose, PanelLeftOpen, Plus, RotateCcw, Send, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { auth } from "@/lib/firebase"

type ChatMessage = {
    role: "user" | "assistant"
    content: string
    links?: RelatedLink[]
}

type RelatedLink = {
    title: string
    description: string
    url: string
}

type SearchSession = {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: string
    updatedAt: string
}

const storageKey = "jobInfoSearchSessions"
const suggestions = [
    "네이버의 개발자 직무는 어떤 것이 있나요?",
    "카카오의 평균 연봉은 얼마인가요?",
    "IT 기업의 복지 혜택에 대해 알려주세요.",
    "데이터 분석가로 취업하려면 어떤 준비가 필요한가요?",
]

function formatTime(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return new Intl.DateTimeFormat("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date)
}

function createSessionTitle(question: string) {
    const normalized = question.replace(/\s+/g, " ").trim()
    if (normalized.length <= 24) return normalized
    return `${normalized.slice(0, 24)}...`
}

export default function JobInfoAIPage() {
    const [sessions, setSessions] = useState<SearchSession[]>([])
    const [activeSessionId, setActiveSessionId] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [question, setQuestion] = useState("")
    const [loading, setLoading] = useState(false)
    const [historyOpen, setHistoryOpen] = useState(true)
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
    const [authLoading, setAuthLoading] = useState(true)

    const activeSession = useMemo(
        () => sessions.find((session) => session.id === activeSessionId) || null,
        [sessions, activeSessionId],
    )

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
            setAuthLoading(false)

            if (!user) {
                setSessions([])
                setActiveSessionId("")
                setMessages([])
                return
            }

            const saved = JSON.parse(localStorage.getItem(storageKey) || "[]") as SearchSession[]
            setSessions(saved)
            if (saved[0]) {
                setActiveSessionId(saved[0].id)
                setMessages(saved[0].messages)
            }
        })

        const pendingQuestion = localStorage.getItem("pendingJobInfoQuestion")
        if (pendingQuestion) {
            localStorage.removeItem("pendingJobInfoQuestion")
            window.setTimeout(() => submitQuestion(pendingQuestion), 150)
        }

        return () => unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const persistSessions = (nextSessions: SearchSession[]) => {
        setSessions(nextSessions)
        localStorage.setItem(storageKey, JSON.stringify(nextSessions))
    }

    const startNewSearch = () => {
        setActiveSessionId("")
        setMessages([])
        setQuestion("")
    }

    const selectSession = (session: SearchSession) => {
        setActiveSessionId(session.id)
        setMessages(session.messages)
        setQuestion("")
    }

    const deleteSession = (id: string) => {
        const nextSessions = sessions.filter((session) => session.id !== id)
        persistSessions(nextSessions)
        if (activeSessionId === id) {
            setActiveSessionId("")
            setMessages([])
        }
    }

    const saveConversation = (nextMessages: ChatMessage[], firstQuestion: string) => {
        if (!auth.currentUser && !currentUser) return
        const now = new Date().toISOString()
        const existing = activeSessionId
            ? sessions.find((session) => session.id === activeSessionId)
            : null
        const nextSession: SearchSession = {
            id: existing?.id || `job-search-${Date.now()}`,
            title: existing?.title || createSessionTitle(firstQuestion),
            messages: nextMessages,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
        }
        const nextSessions = existing
            ? sessions.map((session) => (session.id === existing.id ? nextSession : session))
            : [nextSession, ...sessions]

        persistSessions(nextSessions)
        setActiveSessionId(nextSession.id)
    }

    const submitQuestion = async (value = question) => {
        const trimmed = value.trim()
        if (!trimmed || loading) return

        const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }]
        setMessages(nextMessages)
        setQuestion("")
        setLoading(true)

        try {
            const response = await fetch("/api/job-info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: trimmed,
                    history: messages,
                }),
            })
            const data = (await response.json()) as { text?: string; links?: RelatedLink[] }
            const answer = data.text || "답변을 생성하지 못했습니다. 질문을 조금 더 구체적으로 입력해주세요."
            const completedMessages: ChatMessage[] = [...nextMessages, { role: "assistant", content: answer, links: data.links || [] }]
            setMessages(completedMessages)
            saveConversation(completedMessages, trimmed)
        } catch {
            const answer = "일시적으로 AI 답변을 생성하지 못했습니다. 공식 채용 페이지와 최신 공시자료를 함께 확인해보세요."
            const completedMessages: ChatMessage[] = [...nextMessages, { role: "assistant", content: answer }]
            setMessages(completedMessages)
            saveConversation(completedMessages, trimmed)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen bg-[#f5f9ff]">
            <aside className={`flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-100 bg-white transition-all duration-300 ease-in-out ${historyOpen ? "w-[235px]" : "w-0"}`}>
                <div className="flex h-[70px] items-center gap-3 border-b px-6">
                    <button type="button" onClick={() => setHistoryOpen(false)} aria-label="검색 기록 닫기">
                        <ArrowLeft className="h-5 w-5 text-slate-400" />
                    </button>
                    <h1 className="whitespace-nowrap text-lg font-black text-slate-900">검색 기록</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {!authLoading && !currentUser ? (
                        <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                            <Lock className="h-9 w-9 text-slate-500" />
                            <p className="mt-5 text-sm font-bold leading-6 text-slate-500">
                                로그인하여 검색 기록을 저장하고 관리하세요.
                            </p>
                            <div className="mt-7 space-y-3 text-left text-sm text-[#2f74ff]">
                                <p>✓ 모든 검색 기록 저장</p>
                                <p>✓ 이전 대화 이어가기</p>
                                <p>✓ 맞춤형 검색 결과</p>
                            </div>
                            <div className="mt-8 grid w-full grid-cols-2 gap-2">
                                <Link href="/login">
                                    <Button type="button" className="h-10 w-full rounded-lg bg-[#2f74ff] text-sm font-bold text-white">
                                        <LogIn className="mr-1 h-4 w-4" /> 로그인
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button type="button" variant="outline" className="h-10 w-full rounded-lg border-[#2f74ff] text-sm font-bold text-[#2f74ff]">
                                        <UserPlus className="mr-1 h-4 w-4" /> 회원가입
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="mt-1 rounded-lg border border-dashed border-blue-200 bg-blue-50/40 px-5 py-8 text-center">
                            <Clock3 className="mx-auto h-6 w-6 text-slate-300" />
                            <p className="mt-4 text-sm font-bold text-slate-700">검색 기록이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sessions.map((session) => (
                                <button
                                    key={session.id}
                                    type="button"
                                    onClick={() => selectSession(session)}
                                    className={`group w-full rounded-xl border p-4 text-left transition ${
                                        session.id === activeSessionId
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-slate-200 bg-white hover:border-blue-200"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#397df0]">
                                            <RotateCcw className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">오늘</span>
                                            <span className="mt-2 line-clamp-2 block text-sm font-extrabold leading-5 text-slate-900">{session.title}</span>
                                            <span className="mt-2 block text-xs text-slate-500">{formatTime(session.updatedAt)}</span>
                                        </span>
                                        <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-400">1건</span>
                                    </div>
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            deleteSession(session.id)
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.stopPropagation()
                                                deleteSession(session.id)
                                            }
                                        }}
                                        className="mt-3 hidden w-full items-center justify-center rounded-lg bg-white py-2 text-xs font-bold text-slate-400 shadow-sm group-hover:flex"
                                    >
                                        <Trash2 className="mr-1 h-3.5 w-3.5" /> 삭제
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t p-3">
                    <Button type="button" onClick={startNewSearch} className="h-11 w-full rounded-lg bg-[#397df0] text-sm font-bold text-white hover:bg-blue-700">
                        <Plus className="mr-1 h-4 w-4" /> 새 검색 시작하기
                    </Button>
                </div>
            </aside>
            {!historyOpen && (
                <button
                    type="button"
                    onClick={() => setHistoryOpen(true)}
                    aria-label="검색 기록 열기"
                    className="absolute left-0 top-1/2 z-20 flex h-16 w-9 -translate-y-1/2 items-center justify-center rounded-r-xl bg-[#397df0] text-white shadow-lg transition hover:bg-blue-700"
                >
                    <PanelLeftOpen className="h-5 w-5" />
                </button>
            )}

            <section className="flex min-w-0 flex-1 flex-col">
                {historyOpen && (
                    <button
                        type="button"
                        onClick={() => setHistoryOpen(false)}
                        className="fixed left-[235px] top-24 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-[#397df0]"
                        aria-label="검색 기록 닫기"
                    >
                        <PanelLeftClose className="h-4 w-4" />
                    </button>
                )}
                <div className="flex flex-1 items-center justify-center px-6 py-8">
                    <div className={`flex h-full min-h-[520px] w-full flex-col rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 ${historyOpen ? "max-w-[820px]" : "max-w-[980px]"}`}>
                        {messages.length === 0 ? (
                            <div className="m-auto max-w-[560px] text-center">
                                <h2 className="text-3xl font-black text-slate-950">직장 정보 AI 검색</h2>
                                <p className="mt-4 text-sm leading-6 text-slate-500">
                                    원하는 기업이나 직무에 대해 자연어로 질문해보세요. AI가 맞춤형 답변을 제공해 드립니다.
                                </p>
                                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {suggestions.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => submitQuestion(item)}
                                            className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50"
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto px-8 py-7">
                                {activeSession && (
                                    <div className="mb-6 text-center">
                                        <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-[#397df0]">{activeSession.title}</span>
                                    </div>
                                )}
                                <div className="space-y-5">
                                    {messages.map((message, index) => (
                                        <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-5 py-4 text-sm leading-7 ${
                                                message.role === "user"
                                                    ? "bg-[#397df0] text-white"
                                                    : "border border-slate-200 bg-slate-50 text-slate-700"
                                            }`}>
                                                {message.content}
                                                {message.role === "assistant" && message.links && message.links.length > 0 && (
                                                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <p className="text-sm font-extrabold text-slate-800">관련 링크</p>
                                                            <span className="text-xs font-bold text-slate-400">{message.links.length}개</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {message.links.map((link, linkIndex) => (
                                                                <a
                                                                    key={`${link.url}-${linkIndex}`}
                                                                    href={link.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:border-blue-200"
                                                                >
                                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#397df0] text-xs font-black text-white">
                                                                        {linkIndex + 1}
                                                                    </span>
                                                                    <span className="min-w-0 flex-1">
                                                                        <span className="block truncate text-sm font-extrabold text-slate-800">{link.title}</span>
                                                                        <span className="mt-1 line-clamp-1 block text-xs text-slate-500">{link.description}</span>
                                                                    </span>
                                                                    <ExternalLink className="h-4 w-4 text-[#397df0]" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-500">
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-[#397df0]" />
                                                답변 생성 중...
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-[#d7e5ff] bg-white/80 px-4 py-4">
                    <div className={`mx-auto rounded-[24px] border border-[#d7e5ff] bg-white p-3 shadow-[0_8px_30px_rgba(43,91,181,0.12)] transition-all duration-300 ${historyOpen ? "max-w-[calc(100vw-500px)]" : "max-w-[calc(100vw-280px)]"}`}>
                        <div className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#397df0]">AI 검색</div>
                        <div className="flex items-end gap-3">
                            <Textarea
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault()
                                        submitQuestion()
                                    }
                                }}
                                placeholder="회사, 연봉, 복지, 직무 정보를 문장으로 바로 질문하세요."
                                className="min-h-[58px] resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                            />
                            <Button type="button" disabled={loading || !question.trim()} onClick={() => submitQuestion()} className="mb-1 h-11 rounded-xl bg-[#397df0] px-5 text-white disabled:bg-slate-300">
                                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                <span className="ml-2">질문</span>
                            </Button>
                        </div>
                        <div className="mt-2 flex gap-2 text-xs text-slate-400">
                            <span className="rounded-full border px-3 py-1">↵ Enter 전송</span>
                            <span className="rounded-full border px-3 py-1">Shift + Enter 줄바꿈</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
