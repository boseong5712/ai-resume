"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type SavedResume = {
    id: string
    title: string
    data: unknown
    createdAt: string
    updatedAt: string
    isMain?: boolean
}

export default function SavedResumesPage() {
    const router = useRouter()
    const [resumes, setResumes] = useState<SavedResume[]>([])
    const [nowTime, setNowTime] = useState(0)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const saved = JSON.parse(localStorage.getItem("savedResumes") || "[]")
            setResumes(saved)
            setNowTime(Date.now())
        }, 0)

        return () => window.clearTimeout(timer)
    }, [])

    const saveResumes = (next: SavedResume[]) => {
        localStorage.setItem("savedResumes", JSON.stringify(next))
        setResumes(next)
    }

    const handleEdit = (resume: SavedResume) => {
        localStorage.setItem("editingResumeId", resume.id)
        localStorage.setItem("resumeBuilderMode", "edit")
        localStorage.removeItem("previewResumeId")
        localStorage.removeItem("resumeData")
        router.push("/tools/resume-builder")
    }

    const handleView = (resume: SavedResume) => {
        localStorage.setItem("previewResumeId", resume.id)
        localStorage.setItem("resumeData", JSON.stringify(resume.data))
        router.push("/tools/resume-builder/preview")
    }

    const handleDelete = (id: string) => {
        const ok = window.confirm("이 이력서를 삭제하시겠습니까?")
        if (!ok) return

        const next = resumes.filter((resume) => resume.id !== id)
        saveResumes(next)
    }

    const handleSetMain = (id: string) => {
        const next = resumes.map((resume) => ({
            ...resume,
            isMain: resume.id === id,
        }))

        saveResumes(next)
    }

    const getDateText = (date: string) => {
        const diff = (nowTime || new Date(date).getTime()) - new Date(date).getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return "오늘"
        return `${days}일 전`
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

                        <h1 className="text-3xl font-bold text-slate-900">
                            저장된 이력서
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            작성한 이력서를 관리하고 편집할 수 있습니다
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem("editingResumeId")
                            localStorage.removeItem("resumeBuilderMode")
                            localStorage.removeItem("resumeData")
                            router.push("/tools/resume-builder")
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        + 새 이력서 작성
                    </Button>
                </div>

                {resumes.length === 0 ? (
                    <div className="rounded-2xl border p-10 text-center text-slate-500">
                        저장된 이력서가 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-5">
                        {resumes.map((resume) => (
                            <div
                                key={resume.id}
                                className="rounded-2xl border bg-white p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {resume.title}
                                    </h2>

                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                                        완성됨
                                    </span>
                                </div>

                                <p className="mt-5 text-sm text-slate-500">
                                    최종 수정: {getDateText(resume.updatedAt)}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => handleEdit(resume)}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        수정하기
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleView(resume)}
                                    >
                                        👁보기
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleSetMain(resume.id)}
                                        className="border-orange-300 text-orange-500"
                                    >
                                        ☆ 대표설정
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleDelete(resume.id)}
                                        className="text-red-500"
                                    >
                                        🗑삭제
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
