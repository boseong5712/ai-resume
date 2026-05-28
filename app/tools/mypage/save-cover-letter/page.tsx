"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type SavedCoverLetter = {
    id: string
    title: string
    company?: string
    job?: string
    integratedCoverLetter?: string
    status?: "saved" | "draft"
    createdAt?: string
    updatedAt?: string
}

function formatDate(value?: string) {
    if (!value) return "날짜 없음"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "날짜 없음"
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
}

export default function SavedCoverLettersPage() {
    const router = useRouter()
    const [coverLetters, setCoverLetters] = useState<SavedCoverLetter[]>(() => {
        if (typeof window === "undefined") return []
        return JSON.parse(localStorage.getItem("savedCoverLetters") || "[]") as SavedCoverLetter[]
    })

    const saveCoverLetters = (next: SavedCoverLetter[]) => {
        localStorage.setItem("savedCoverLetters", JSON.stringify(next))
        setCoverLetters(next)
    }

    const handleView = (id: string) => {
        localStorage.setItem("viewCoverLetterId", id)
        localStorage.setItem("coverLetterMode", "view")
        router.push("/tools/cover-letter")
    }

    const handleEdit = (id: string) => {
        localStorage.setItem("editingCoverLetterId", id)
        localStorage.setItem("coverLetterMode", "edit")
        router.push("/tools/cover-letter")
    }

    const handleDelete = (id: string) => {
        if (!window.confirm("저장된 자소서를 삭제하시겠습니까?")) return
        saveCoverLetters(coverLetters.filter((coverLetter) => coverLetter.id !== id))
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-10 shadow-sm">
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <button
                            type="button"
                            onClick={() => router.push("/tools/mypage/profile")}
                            className="mb-8 text-sm text-slate-500"
                        >
                            ← 돌아가기
                        </button>

                        <h1 className="text-3xl font-bold text-slate-900">저장된 자소서</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            작성한 자소서를 관리하고 편집할 수 있습니다
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem("editingCoverLetterId")
                            localStorage.removeItem("viewCoverLetterId")
                            localStorage.removeItem("coverLetterMode")
                            router.push("/tools/cover-letter")
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        새 자소서 작성
                    </Button>
                </div>

                {coverLetters.length === 0 ? (
                    <div className="rounded-2xl border p-10 text-center text-slate-500">
                        저장된 자소서가 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-5">
                        {coverLetters.map((coverLetter) => (
                            <div key={coverLetter.id} className="rounded-2xl border bg-white p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {coverLetter.title}
                                    </h2>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            coverLetter.status === "saved"
                                                ? "bg-blue-50 text-blue-600"
                                                : "bg-slate-50 text-slate-500"
                                        }`}
                                    >
                                        {coverLetter.status === "saved" ? "저장됨" : "임시저장"}
                                    </span>
                                </div>

                                <p className="mt-5 text-sm text-slate-500">
                                    {formatDate(coverLetter.updatedAt || coverLetter.createdAt)}
                                </p>
                                {coverLetter.integratedCoverLetter?.trim() && (
                                    <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                        통합본 저장됨
                                    </div>
                                )}

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" onClick={() => handleView(coverLetter.id)}>
                                        보기
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => handleEdit(coverLetter.id)}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        수정하기
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-orange-300 text-orange-500"
                                    >
                                        맞춤 후 설정
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleDelete(coverLetter.id)}
                                        className="text-red-500"
                                    >
                                        삭제
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
