"use client"
console.log(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignupPage() {
    const router = useRouter()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSignup = async () => {
        if (!name.trim()) {
            setError("이름을 입력해주세요.")
            return
        }

        if (!email.trim()) {
            setError("이메일을 입력해주세요.")
            return
        }

        if (!password.trim()) {
            setError("비밀번호를 입력해주세요.")
            return
        }

        if (password.length < 6) {
            setError("비밀번호는 6자 이상이어야 합니다.")
            return
        }

        if (password !== confirmPassword) {
            setError("비밀번호 확인이 일치하지 않습니다.")
            return
        }

        try {
            setLoading(true)
            setError("")

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )

            const user = userCredential.user
            console.log("1. Auth 회원가입 성공:", user.uid)

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name,
                email,
                createdAt: serverTimestamp(),
            })

            console.log("2. Firestore 저장 성공")
            console.log("3. 로그인 페이지로 이동")

            router.push("/login")
        } catch (err: any) {
            console.error("회원가입 에러:", err)
            setError(err.message || "회원가입에 실패했습니다.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-blue-600">
                        회원가입
                    </h1>
                    <p className="mt-3 text-sm text-slate-500">
                        자소서빌더 계정을 만들어 서비스를 이용해보세요
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <Input
                        type="text"
                        placeholder="이름을 입력해주세요"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12"
                    />

                    <Input
                        type="email"
                        placeholder="이메일을 입력해주세요"
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

                    <Input
                        type="password"
                        placeholder="비밀번호를 다시 입력해주세요"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12"
                    />
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-500">{error}</p>
                )}

                <Button
                    className="mt-6 h-12 w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleSignup}
                    disabled={loading}
                >
                    {loading ? "가입 중..." : "회원가입"}
                </Button>
            </div>
        </div>
    )
}
