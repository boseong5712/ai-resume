"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type MouseEvent } from "react"
import {
    BriefcaseBusiness,
    ChevronDown,
    ChevronRight,
    FilePenLine,
    Home,
    LogIn,
    LogOut,
    Lock,
    MessageCircle,
    Monitor,
    Search,
    Star,
    Wrench,
} from "lucide-react"
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { auth, db } from "@/lib/firebase"

const toolItems = [
    { href: "/tools/resume-builder", label: "이력서 생성기", icon: BriefcaseBusiness },
    { href: "/tools/resume-feedback", label: "이력서 피드백", icon: MessageCircle },
    { href: "/tools/cover-letter", label: "자소서 생성기", icon: FilePenLine },
    { href: "/tools/review", label: "자소서 평가", icon: MessageCircle },
    { href: "/tools/ai-interviewer", label: "AI 면접관", icon: Monitor },
]

const protectedToolPaths = ["/tools/resume-builder", "/tools/resume-feedback", "/tools/cover-letter", "/tools/review", "/tools/ai-interviewer"]

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [toolsOpen, setToolsOpen] = useState(true)
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
    const [userProfile, setUserProfile] = useState<{ uid: string; name: string; email: string } | null>(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [loginModalOpen, setLoginModalOpen] = useState(false)
    const [logoutModalOpen, setLogoutModalOpen] = useState(false)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setAuthLoading(false)
        }, 3000)

        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {
                try {
                    if (!user) {
                        setCurrentUser(null)
                        setUserProfile(null)
                        return
                    }

                    setCurrentUser(user)
                    const userSnap = await getDoc(doc(db, "users", user.uid))

                    if (userSnap.exists()) {
                        const data = userSnap.data() as { uid: string; name: string; email: string }
                        setUserProfile(data)
                    } else {
                        setUserProfile({
                            uid: user.uid,
                            name: "",
                            email: user.email ?? "",
                        })
                    }
                } catch (error) {
                    console.error("사용자 정보 불러오기 실패:", error)
                    setUserProfile(null)
                } finally {
                    window.clearTimeout(timer)
                    setAuthLoading(false)
                }
            },
            (error) => {
                console.error("Auth 상태 확인 실패:", error)
                window.clearTimeout(timer)
                setAuthLoading(false)
            },
        )

        return () => {
            window.clearTimeout(timer)
            unsubscribe()
        }
    }, [])

    const handleLogout = async () => {
        try {
            setLogoutModalOpen(false)
            await signOut(auth)
            localStorage.removeItem("resumeData")
            localStorage.removeItem("savedResume")
            setUserProfile(null)
            setCurrentUser(null)
            window.location.href = "/tools/resume-builder"
        } catch (error) {
            console.error("로그아웃 실패:", error)
        }
    }

    const isLoggedIn = Boolean(currentUser || userProfile)
    const isProtectedPage = protectedToolPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    const requireLogin = (event?: MouseEvent) => {
        if (authLoading || isLoggedIn) return false
        event?.preventDefault()
        event?.stopPropagation()
        setLoginModalOpen(true)
        return true
    }

    const linkClass = (active: boolean) =>
        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
            active ? "bg-[#2f74ff] text-white shadow-md" : "text-slate-600 hover:bg-blue-50 hover:text-[#2f74ff]"
        }`

    return (
        <div className="flex min-h-screen bg-[#f4f8ff]">
            <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-5">
                <Link href="/" className="mb-8 flex items-center gap-2 text-2xl font-black tracking-tight text-[#1764ff]">
                    <Star className="h-7 w-7 fill-[#1764ff]" />
                    자소서빌더
                </Link>

                <nav className="space-y-2">
                    <Link href="/" className={linkClass(pathname === "/")}>
                        <Home className="h-4 w-4" />
                        홈
                    </Link>

                    <Link href="/tools/job-info-ai" className={linkClass(pathname.startsWith("/tools/job-info-ai"))}>
                        <Search className="h-4 w-4" />
                        직장 정보 검색 AI
                    </Link>

                    <div>
                        <button
                            type="button"
                            onClick={() => setToolsOpen((open) => !open)}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-[#2f74ff]"
                        >
                            <Wrench className="h-4 w-4" />
                            취업도구
                            {toolsOpen ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
                        </button>
                        {toolsOpen && (
                            <div className="mt-1 space-y-1 pl-4">
                                {toolItems.map((item) => {
                                    const Icon = item.icon
                                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={(event) => requireLogin(event)}
                                            className={linkClass(active)}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                </nav>

                <div className="mt-auto border-t border-slate-100 pt-5">
                    {authLoading ? (
                        <div className="rounded-xl bg-slate-50 px-3 py-4 text-sm font-bold text-slate-400">
                            사용자 정보 불러오는 중...
                        </div>
                    ) : userProfile || currentUser ? (
                        <div className="space-y-3">
                            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                                <div className="text-sm font-extrabold text-slate-800">
                                    {userProfile?.name || "회원"}
                                </div>
                                <div className="mt-1 break-all text-xs leading-5 text-slate-500">
                                    {userProfile?.email || currentUser?.email || ""}
                                </div>
                            </div>

                            <Link href="/tools/mypage/profile" className="block">
                                <Button type="button" className="h-10 w-full rounded-lg bg-[#2f74ff] text-sm font-bold text-white hover:bg-blue-700">
                                    내 정보
                                </Button>
                            </Link>

                            <Button type="button" onClick={() => setLogoutModalOpen(true)} className="h-10 w-full rounded-lg bg-red-500 text-sm font-bold text-white hover:bg-red-600">
                                로그아웃
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login" className="block">
                            <Button type="button" className="h-11 w-full rounded-lg bg-[#2f74ff] text-sm font-bold text-white hover:bg-blue-700">
                                로그인하고 취업하기
                            </Button>
                        </Link>
                    )}
                </div>
            </aside>

            <main
                className="h-screen flex-1 overflow-y-auto"
                onClickCapture={(event) => {
                    if (!isProtectedPage) return
                    const target = event.target as HTMLElement
                    if (target.closest("[data-login-modal]")) return
                    if (target.closest("a[href='/login']")) return
                    requireLogin(event)
                }}
                onKeyDownCapture={(event) => {
                    if (!isProtectedPage || authLoading || isLoggedIn) return
                    const target = event.target as HTMLElement
                    if (target.closest("[data-login-modal]")) return
                    setLoginModalOpen(true)
                    event.preventDefault()
                    event.stopPropagation()
                }}
            >
                {children}
            </main>

            {logoutModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 px-5">
                    <div className="relative w-full max-w-[430px] rounded-2xl bg-[#17243b] px-8 py-9 text-center text-white shadow-2xl">
                        <button type="button" aria-label="로그아웃 안내 닫기" onClick={() => setLogoutModalOpen(false)} className="absolute right-5 top-4 text-3xl font-bold text-slate-400 transition hover:text-white">
                            ×
                        </button>
                        <BriefcaseBusiness className="mx-auto h-16 w-16 fill-[#2f74ff] text-[#2f74ff]" />
                        <h2 className="mt-5 text-2xl font-black">정말로 로그아웃 하시겠어요???</h2>
                        <p className="mt-5 text-lg font-black text-[#3d83ff]">취직이 당신을 기다리고 있습니다! 💼</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            지금 로그아웃하면 진행 중인 자소서 작성이나
                            <br />
                            면접 준비 내용을 놓칠 수 있어요.
                        </p>
                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <Button type="button" onClick={() => setLogoutModalOpen(false)} className="h-12 rounded-xl bg-[#2f74ff] text-sm font-black text-white hover:bg-blue-600">
                                <BriefcaseBusiness className="mr-2 h-4 w-4" /> 취직 준비 계속하기
                            </Button>
                            <Button type="button" onClick={handleLogout} className="h-12 rounded-xl bg-red-500 text-sm font-black text-white hover:bg-red-600">
                                <LogOut className="mr-2 h-4 w-4" /> 로그아웃
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {loginModalOpen && (
                <div data-login-modal className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-5">
                    <div className="relative w-full max-w-[430px] rounded-2xl bg-white px-8 py-8 text-center shadow-2xl">
                        <button
                            type="button"
                            aria-label="로그인 안내 닫기"
                            onClick={() => setLoginModalOpen(false)}
                            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                        >
                            ×
                        </button>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2f74ff] text-white shadow-lg">
                            <Lock className="h-9 w-9" />
                        </div>
                        <h2 className="mt-6 text-2xl font-black text-slate-900">로그인이 필요합니다</h2>
                        <p className="mt-4 text-sm leading-6 text-slate-500">
                            이 기능을 사용하려면 로그인이 필요합니다.
                            <br />
                            회원가입 후 다양한 혜택을 누려보세요!
                        </p>
                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <Button type="button" variant="outline" onClick={() => setLoginModalOpen(false)} className="h-12 rounded-lg border-slate-200 bg-white font-bold text-slate-500">
                                취소
                            </Button>
                            <Link href="/login" className="block">
                                <Button type="button" className="h-12 w-full rounded-lg bg-[#2f74ff] font-bold text-white hover:bg-blue-700">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    로그인하기
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
