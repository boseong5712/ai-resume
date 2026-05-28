"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    mode: "direct" | "file" | "saved"
    result: ReviewResult
    createdAt: string
    updatedAt: string
}

const savedReviewStorageKey = "savedCoverLetterReviews"

function formatDate(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date)
}

function ScoreDonut({ score, size = "large" }: { score: number; size?: "small" | "large" }) {
    const percent = Math.max(0, Math.min(100, score))
    const outer = size === "small" ? "h-20 w-20" : "h-44 w-44"
    const inner = size === "small" ? "h-14 w-14" : "h-32 w-32"
    const scoreText = size === "small" ? "text-lg" : "text-4xl"

    return (
        <div
            className={`relative flex ${outer} items-center justify-center rounded-full`}
            style={{ background: `conic-gradient(#347cff ${percent * 3.6}deg, #e8eef8 0deg)` }}
        >
            <div className={`flex ${inner} flex-col items-center justify-center rounded-full bg-white shadow-inner`}>
                <span className={`${scoreText} font-extrabold text-[#1760d6]`}>{score}</span>
                {size === "large" && <span className="text-sm font-bold text-slate-400">/ 100</span>}
            </div>
        </div>
    )
}

export default function SavedCoverLetterReviewPage() {
    const router = useRouter()
    const [reviews, setReviews] = useState<SavedReview[]>(() => {
        if (typeof window === "undefined") return []
        return JSON.parse(localStorage.getItem(savedReviewStorageKey) || "[]") as SavedReview[]
    })
    const [selectedId, setSelectedId] = useState("")

    const selectedReview = useMemo(
        () => reviews.find((review) => review.id === selectedId) || null,
        [reviews, selectedId],
    )

    const deleteReview = (id: string) => {
        const nextReviews = reviews.filter((review) => review.id !== id)
        setReviews(nextReviews)
        localStorage.setItem(savedReviewStorageKey, JSON.stringify(nextReviews))
        if (selectedId === id) setSelectedId("")
    }

    if (selectedReview) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-8">
                <div className="mx-auto w-full max-w-[1040px] space-y-6">
                    <section className="rounded-[28px] border border-slate-200 bg-white px-9 py-8 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setSelectedId("")}
                            className="mb-7 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#347cff]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            저장된 평가 목록으로 돌아가기
                        </button>
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#347cff]">
                                    저장된 자기소개서 평가
                                </p>
                                <h1 className="text-3xl font-extrabold text-slate-900">{selectedReview.title}</h1>
                                <p className="mt-2 text-sm font-semibold text-slate-500">
                                    {selectedReview.field || "지원 분야 미입력"} · {formatDate(selectedReview.createdAt)}
                                </p>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                                    {selectedReview.result.summary}
                                </p>
                            </div>
                            <ScoreDonut score={selectedReview.result.totalScore} />
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-3 md:grid-cols-5">
                        {selectedReview.result.criteria.map((criterion) => (
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
                            <h2 className="text-xl font-extrabold text-slate-900">상세 피드백</h2>
                            <div className="mt-5 space-y-4">
                                {selectedReview.result.criteria.map((criterion) => (
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
                                <h2 className="text-xl font-extrabold text-slate-900">면접관 코멘트</h2>
                                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                                    {selectedReview.result.detailFeedback.map((feedback, index) => (
                                        <li key={`${feedback}-${index}`} className="rounded-xl bg-slate-50 p-4">
                                            {feedback}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-extrabold text-slate-900">문장 개선사항</h2>
                                <div className="mt-5 space-y-4">
                                    {selectedReview.result.improvements.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                                            바로 수정이 필요한 문장이 발견되지 않았습니다.
                                        </div>
                                    ) : (
                                        selectedReview.result.improvements.map((item, index) => (
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
            <div className="mx-auto w-full max-w-[960px] rounded-[28px] bg-white px-10 py-9 shadow-sm">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <button
                            type="button"
                            onClick={() => router.push("/tools/mypage/profile")}
                            className="mb-8 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#347cff]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            돌아가기
                        </button>
                        <h1 className="text-3xl font-extrabold text-slate-900">저장된 자기소개서 평가</h1>
                        <p className="mt-3 text-sm text-slate-500">자기소개서 평가 결과를 확인하고 개선할 수 있습니다</p>
                    </div>
                    <Button
                        type="button"
                        onClick={() => router.push("/tools/review")}
                        className="h-11 rounded-lg bg-[#347cff] px-5 text-sm font-bold text-white hover:bg-blue-700"
                    >
                        새 평가하기
                    </Button>
                </div>

                {reviews.length === 0 ? (
                    <div className="w-full max-w-[430px] rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                        <ClipboardCheck className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-4 font-bold text-slate-700">저장된 평가 결과가 없습니다.</p>
                        <p className="mt-2 text-sm text-slate-500">자기소개서 평가하기를 누르면 결과가 자동으로 저장됩니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {reviews.map((review) => (
                            <article key={review.id} className="w-full max-w-[430px] rounded-2xl border border-slate-200 bg-white px-7 py-6">
                                <div className="flex items-start justify-between gap-4">
                                    <h2 className="pt-1 text-lg font-extrabold text-slate-900">{review.title}</h2>
                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#347cff]">
                                        저장됨
                                    </span>
                                </div>

                                <p className="mt-5 text-xs font-semibold text-slate-400">{formatDate(review.createdAt)}</p>

                                <div className="mt-6 grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => setSelectedId(review.id)}
                                        className="h-11 rounded-lg bg-[#347cff] text-sm font-bold text-white hover:bg-blue-700"
                                    >
                                        보기
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => deleteReview(review.id)}
                                        className="h-11 rounded-lg border-slate-200 bg-white text-sm font-bold text-rose-500 hover:bg-rose-50"
                                    >
                                        삭제
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
