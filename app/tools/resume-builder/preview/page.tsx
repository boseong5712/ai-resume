"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type ResumeData = any

export default function ResumePreviewPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<ResumeData | null>(null)

    useEffect(() => {
        const previewResumeId = localStorage.getItem("previewResumeId")
        const savedResumes = JSON.parse(localStorage.getItem("savedResumes") || "[]")

        if (previewResumeId) {
            const targetResume = savedResumes.find(
                (resume: any) => resume.id === previewResumeId
            )

            if (targetResume) {
                setFormData(targetResume.data)
                return
            }
        }

        const saved = localStorage.getItem("resumeData")
        if (saved) setFormData(JSON.parse(saved))
    }, [])

    const handleSaveResume = () => {
        if (!formData) return

        const ok = window.confirm(
            "이력서를 저장하시겠습니까?\n저장 후에도 언제든지 수정할 수 있습니다."
        )

        if (!ok) return

        const savedResumes = JSON.parse(localStorage.getItem("savedResumes") || "[]")
        const editingResumeId = localStorage.getItem("editingResumeId")
        const now = new Date().toISOString()

        if (editingResumeId) {
            const updatedResumes = savedResumes.map((resume: any) =>
                resume.id === editingResumeId
                    ? {
                        ...resume,
                        title: formData.resumeTitle || formData.name || "제목 없는 이력서",
                        data: formData,
                        updatedAt: now,
                    }
                    : resume
            )

            localStorage.setItem("savedResumes", JSON.stringify(updatedResumes))
            localStorage.removeItem("editingResumeId")
        } else {
            const newResume = {
                id: crypto.randomUUID(),
                title: formData.resumeTitle || formData.name || "제목 없는 이력서",
                data: formData,
                createdAt: now,
                updatedAt: now,
                isMain: false,
            }

            localStorage.setItem("savedResumes", JSON.stringify([newResume, ...savedResumes]))
        }

        router.push("/tools/mypage/save-builder-resume")
    }

    if (!formData) {
        return (
            <div className="min-h-screen bg-slate-100 p-8">
                <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 shadow">
                    불러올 이력서가 없습니다.
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="sticky top-0 z-40 border-b bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            이력서 미리보기
                        </h1>
                        <p className="text-sm text-slate-500">
                            템플릿과 설정을 확인한 후 저장하세요
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push("/tools/resume-builder")}>
                            ← 되돌아가기
                        </Button>

                        <Button
                            type="button"
                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                            onClick={handleSaveResume}
                        >
                            저장하기
                        </Button>

                        <Button type="button" className="bg-red-500 text-white hover:bg-red-600">
                            고품질 PDF
                        </Button>

                        <Button variant="outline" type="button">
                            워드 내보내기
                        </Button>

                        <Button variant="outline" type="button" disabled>
                            브라우저 인쇄
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-6 py-6">
                <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl border bg-white p-4">
                    <div className="rounded-lg border p-4">
                        <div className="text-xs text-slate-400">템플릿</div>
                        <div className="mt-1 font-semibold">모던</div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="text-xs text-slate-400">색상</div>
                        <div className="mt-1 flex items-center gap-2 font-semibold">
                            <span className="h-3 w-3 rounded-full bg-blue-600" />
                            블루
                        </div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="text-xs text-slate-400">글꼴</div>
                        <div className="mt-1 font-semibold">모던</div>
                    </div>
                </div>

                <div className="rounded-xl bg-slate-200 p-8">
                    <div className="space-y-6">
                        <section className="rounded-2xl bg-white p-8 shadow-sm">
                            <div className="flex justify-between">
                                <div>
                                    <h2 className="text-5xl font-bold text-blue-600">
                                        {formData.name || "이름 미입력"}
                                    </h2>
                                    <div className="mt-4 h-1 w-20 bg-blue-600" />
                                    <p className="mt-4 text-sm text-slate-600">
                                        {formData.email} · {formData.phone}
                                    </p>
                                </div>

                                <div className="text-xs text-slate-400">
                                    이미지 없음
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl bg-white p-8 shadow-sm">
                            <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">교육</h3>

                            {formData.education?.length === 0 ? (
                                <p className="text-sm text-slate-400">입력된 학력이 없습니다.</p>
                            ) : (
                                formData.education?.map((edu: any, index: number) => (
                                    <div key={index} className="mb-4">
                                        <div className="font-bold">
                                            {edu.schoolName}
                                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                                {edu.admissionDate} - {edu.graduationDate || "현재"}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-slate-700">{edu.major}</div>
                                        <div className="mt-1 text-sm text-slate-500">{edu.status}</div>
                                    </div>
                                ))
                            )}
                        </section>

                        <section className="rounded-2xl bg-white p-8 shadow-sm">
                            <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">경력</h3>

                            {formData.career?.length === 0 ? (
                                <p className="text-sm text-slate-400">입력된 경력이 없습니다.</p>
                            ) : (
                                formData.career?.map((career: any, index: number) => (
                                    <div key={index} className="mb-4">
                                        <div className="font-bold">
                                            {career.companyName}
                                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                                {career.startDate} - {career.isCurrent ? "현재" : career.endDate}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-slate-700">{career.position}</div>
                                        <p className="mt-2 text-sm text-slate-500">{career.description}</p>
                                    </div>
                                ))
                            )}
                        </section>

                        <section className="rounded-2xl bg-white p-8 shadow-sm">
                            <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">기술</h3>

                            {formData.skillGroups?.length === 0 ? (
                                <p className="text-sm text-slate-400">입력된 기술이 없습니다.</p>
                            ) : (
                                formData.skillGroups?.map((group: any, index: number) => (
                                    <div key={index} className="mb-4">
                                        <div className="font-bold">{group.category}</div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {group.skills?.map((skill: string) => (
                                                <span key={skill} className="rounded-full bg-blue-600 px-3 py-1 text-xs text-white">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </section>

                        <section className="rounded-2xl bg-white p-8 shadow-sm">
                            <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">자격증</h3>

                            {formData.certificates?.length === 0 ? (
                                <p className="text-sm text-slate-400">입력된 자격증이 없습니다.</p>
                            ) : (
                                formData.certificates?.map((cert: any, index: number) => (
                                    <div key={index} className="mb-4">
                                        <div className="font-bold">
                                            {cert.name}
                                            {cert.grade && (
                                                <span className="ml-2 rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                                                    {cert.grade}
                                                </span>
                                            )}
                                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                                {cert.acquiredDate}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-slate-600">{cert.issuer}</div>
                                    </div>
                                ))
                            )}
                        </section>

                        <section className="rounded-2xl bg-white p-8 shadow-sm">
                            <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">수상경력</h3>

                            {formData.awards?.length === 0 ? (
                                <p className="text-sm text-slate-400">입력된 수상경력이 없습니다.</p>
                            ) : (
                                formData.awards?.map((award: any, index: number) => (
                                    <div key={index} className="mb-4">
                                        <div className="font-bold">
                                            {award.title}
                                            <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                                {award.date}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-slate-600">{award.organization}</div>
                                    </div>
                                ))
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}