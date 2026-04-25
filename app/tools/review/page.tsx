"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ReviewPage() {
    return (
        <div className="mx-auto max-w-4xl">
            <Card>
                <CardContent className="space-y-4 p-6">
                    <h2 className="text-lg font-bold">자소서 평가</h2>
                    <textarea
                        className="h-48 w-full rounded-md border p-3"
                        placeholder="자소서를 입력하세요"
                    />
                    <Button className="w-full">평가하기</Button>
                </CardContent>
            </Card>
        </div>
    )
}
