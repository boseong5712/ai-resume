"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LoginPage() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async () => {
        try {
            setLoading(true)
            setError("")

            await signInWithEmailAndPassword(auth, email, password)
            router.push("/")
        } catch (err: any) {
            setError(err.message || "로그인에 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-200 to-blue-300">
            <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-blue-600">JOBMAKER</h1>
                    <p className="mt-4 text-sm text-slate-500">
                        AI 기반 취업 플랫폼에 오신 것을 환영합니다
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <Input
                        type="email"
                        placeholder="아이디를 입력해주세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                    />
                    <Input
                        type="password"
                        placeholder="비밀번호를 입력해주세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12"
                    />
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-500">{error}</p>
                )}

                <Button
                    className="mt-6 h-12 w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "로그인 중..." : "로그인"}
                </Button>

                <Link href="/signup">
                    <Button variant="outline" className="mt-3 h-12 w-full">
                        회원가입
                    </Button>
                </Link>
            </div>
        </div>
    )
}