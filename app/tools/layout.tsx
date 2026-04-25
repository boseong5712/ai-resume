"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"

const menuItems = [
    { href: "/tools/resume-builder", label: "이력서 생성기" },
    { href: "/tools/cover-letter", label: "자소서 생성기" },
    { href: "/tools/review", label: "자소서 평가" },
]

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
    const [userProfile, setUserProfile] = useState<{ uid: string; name: string; email: string } | null>(null)
    const [authLoading, setAuthLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (!user) {
                    setCurrentUser(null)
                    setUserProfile(null)
                    setAuthLoading(false)
                    return
                }

                setCurrentUser(user)
                const userSnap = await getDoc(doc(db, "users", user.uid))

                if (userSnap.exists()) {
                    const data = userSnap.data() as { uid: string; name: string; email: string }
                    setUserProfile(data)
                } else {
                    setUserProfile({ uid: user.uid, name: "", email: user.email ?? "" })
                }
            } catch (error) {
                console.error("사용자 정보 불러오기 실패:", error)
            } finally {
                setAuthLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

    const handleLogout = async () => {
        try {
            await signOut(auth)
            setUserProfile(null)
            setCurrentUser(null)
        } catch (error) {
            console.error("로그아웃 실패:", error)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 shrink-0 border-r bg-white p-4 flex h-screen flex-col">
                <div>
                    <h1 className="mb-6 text-xl font-bold text-blue-600">자소서메이커</h1>

                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const active = pathname === item.href || pathname.startsWith(item.href + "/")
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block rounded-md px-4 py-2 text-sm font-medium ${active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-auto border-t pt-6">
                    {authLoading ? (
                        <div className="px-1 text-sm text-slate-400">사용자 정보 불러오는 중...</div>
                    ) : userProfile ? (
                        <div className="space-y-3">
                            <div className="rounded-xl border bg-slate-50 p-3">
                                <div className="text-sm font-semibold text-slate-800">{userProfile.name || "회원"}</div>
                                <div className="mt-1 break-all text-xs text-slate-500">{userProfile.email}</div>
                            </div>

                            <Link href="/tools/mypage/profile">
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    type="button"
                                >
                                    내 정보
                                </Button>
                            </Link>

                            <Button variant="outline" className="w-full" type="button" onClick={handleLogout}>
                                로그아웃
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login" className="block">
                            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">로그인하고 취업하기</Button>
                        </Link>
                    )}
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-10">{children}</main>
        </div>
    )
}
