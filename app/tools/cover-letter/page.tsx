"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function CoverLetterPage() {
    return (
        <div className="mx-auto max-w-4xl">
            <Card>
                <CardContent className="space-y-4 p-6">
                    <h2 className="text-lg font-bold">자소서 생성기</h2>
                    <Input placeholder="지원 회사" />
                    <Input placeholder="지원 직무" />
                    <Input placeholder="핵심 경험" />
                    <Button className="w-full">AI 자소서 생성</Button>
                </CardContent>
            </Card>
        </div>
    )
}
