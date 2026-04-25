"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type ResumeData = any

export default function ResumePreviewPage() {
    const [data, setData] = useState<ResumeData | null>(null)

    useEffect(() => {
        const saved = localStorage.getItem("resumeData")
        if (saved) setData(JSON.parse(saved))
    }, [])

    if (!data) {
        return <div className="p-10">저장된 이력서 데이터가 없습니다.</div>
    }

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 shadow">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-blue-600">{data.name || "이름 미입력"}</h1>
                        <p className="mt-3 text-slate-600">{data.email} · {data.phone}</p>
                    </div>
                    <Button variant="outline" onClick={() => history.back()}>다시 수정하기</Button>
                </div>

                <hr className="my-8" />

                <section className="mb-8">
                    <h2 className="mb-3 text-xl font-bold text-blue-600">학력</h2>
                    {data.education?.length ? data.education.map((edu: any, i: number) => (
                        <div key={i} className="mb-3 rounded-lg border p-4">
                            <div className="font-semibold">{edu.schoolName}</div>
                            <div className="text-slate-600">{edu.major} · {edu.degree} · {edu.status}</div>
                            <div className="text-sm text-slate-500">{edu.admissionDate} ~ {edu.graduationDate}</div>
                        </div>
                    )) : <p className="text-slate-400">입력된 학력사항이 없습니다.</p>}
                </section>

                <section className="mb-8">
                    <h2 className="mb-3 text-xl font-bold text-blue-600">경력</h2>
                    {data.career?.length ? data.career.map((career: any, i: number) => (
                        <div key={i} className="mb-3 rounded-lg border p-4">
                            <div className="font-semibold">{career.companyName}</div>
                            <div className="text-slate-600">{career.position}</div>
                            <p className="mt-2 whitespace-pre-line text-sm text-slate-500">{career.description}</p>
                        </div>
                    )) : <p className="text-slate-400">입력된 경력사항이 없습니다.</p>}
                </section>

                <section className="mb-8">
                    <h2 className="mb-3 text-xl font-bold text-blue-600">보유기술</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skillGroups?.flatMap((group: any) => group.skills ?? []).length ? (
                            data.skillGroups.flatMap((group: any) => group.skills ?? []).map((skill: string, i: number) => (
                                <span key={`${skill}-${i}`} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p className="text-slate-400">입력된 보유기술이 없습니다.</p>
                        )}
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="mb-3 text-xl font-bold text-blue-600">자격증</h2>
                    {data.certificates?.length ? data.certificates.map((cert: any, i: number) => (
                        <div key={i} className="mb-2">{cert.name} · {cert.issuer} · {cert.acquiredDate}</div>
                    )) : <p className="text-slate-400">입력된 자격증이 없습니다.</p>}
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-blue-600">수상경력</h2>
                    {data.awards?.length ? data.awards.map((award: any, i: number) => (
                        <div key={i} className="mb-2">{award.title} · {award.organization} · {award.date}</div>
                    )) : <p className="text-slate-400">입력된 수상경력이 없습니다.</p>}
                </section>
            </div>
        </div>
    )
}
