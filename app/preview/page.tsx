"use client"

import { useEffect, useState } from "react"

export default function PreviewPage() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const saved = localStorage.getItem("resumeData")

        if (saved) {
            setData(JSON.parse(saved))
        }
    }, [])

    if (!data) {
        return <div className="p-10">데이터 불러오는 중...</div>
    }

    return (
        <div className="max-w-3xl mx-auto p-10 space-y-6">

            <h1 className="text-3xl font-bold">
                {data.name}
            </h1>

            <div>{data.email}</div>
            <div>{data.phone}</div>

        </div>
    )
}