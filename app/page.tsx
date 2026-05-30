"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, type MouseEvent } from "react"
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import {
    BriefcaseBusiness,
    CheckCircle2,
    ChevronDown,
    FilePenLine,
    Home,
    Lock,
    LogIn,
    LogOut,
    MessageCircle,
    Monitor,
    PenLine,
    Search,
    Star,
    Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth, db } from "@/lib/firebase"

const protectedPaths = ["/tools/resume-builder", "/tools/cover-letter", "/tools/review", "/tools/resume-feedback", "/tools/ai-interviewer"]

const mainTools = [
    {
        href: "/tools/cover-letter",
        eyebrow: "문서 초안",
        title: "AI 자소서 생성기",
        description: "공고에 맞춰 초안을 빠르게 만듭니다.",
        icon: FilePenLine,
        accent: "text-blue-600",
    },
    {
        href: "/tools/ai-interviewer",
        eyebrow: "실전 연습",
        title: "AI 면접관",
        description: "질문 생성과 답변 점검을 바로 이어갑니다.",
        icon: Monitor,
        accent: "text-violet-600",
    },
    {
        href: "/tools/resume-builder",
        eyebrow: "기본 문서",
        title: "이력서 빌더",
        description: "기본 이력서를 구조적으로 정리해 시작합니다.",
        icon: BriefcaseBusiness,
        accent: "text-emerald-600",
    },
]

const allTools = [
    ["자소서 작성", FilePenLine, "/tools/cover-letter"],
    ["이력서 작성", BriefcaseBusiness, "/tools/resume-builder"],
    ["자소서 수정", PenLine, "/tools/cover-letter"],
    ["이력서 피드백", MessageCircle, "/tools/resume-feedback"],
    ["자소서 검사", CheckCircle2, "/tools/review"],
    ["AI 면접관", Monitor, "/tools/ai-interviewer"],
] as const

export default function HomePage() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
    const [userProfile, setUserProfile] = useState<{ uid: string; name: string; email: string } | null>(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [loginModalOpen, setLoginModalOpen] = useState(false)
    const [logoutModalOpen, setLogoutModalOpen] = useState(false)
    const [toolsOpen, setToolsOpen] = useState(true)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setAuthLoading(false)
        }, 3000)

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
        })

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
        } catch (error) {
            console.error("로그아웃 실패:", error)
        }
    }

    const isProtected = (href: string) => protectedPaths.some((path) => href === path || href.startsWith(`${path}/`))

    const guardLink = (href: string, event: MouseEvent) => {
        if (authLoading || currentUser || userProfile || !isProtected(href)) return
        event.preventDefault()
        setLoginModalOpen(true)
    }

    const submitSearch = () => {
        const trimmed = search.trim()
        if (!trimmed) return
        localStorage.setItem("pendingJobInfoQuestion", trimmed)
        router.push("/tools/job-info-ai")
    }

    const sidebarLinkClass = (active = false) =>
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
                    <Link href="/" className={sidebarLinkClass(true)}>
                        <Home className="h-4 w-4" />
                        홈
                    </Link>
                    <Link href="/tools/job-info-ai" className={sidebarLinkClass()}>
                        <Search className="h-4 w-4" />
                        직장 정보 검색 AI
                    </Link>
                    <button type="button" onClick={() => setToolsOpen((open) => !open)} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-[#2f74ff]">
                        <Wrench className="h-4 w-4" />
                        취업도구
                        <ChevronDown className="ml-auto h-4 w-4" />
                    </button>
                    {toolsOpen && (
                        <div className="space-y-1 pl-4">
                            {[
                                ["/tools/resume-builder", "이력서 생성기", BriefcaseBusiness],
                                ["/tools/resume-feedback", "이력서 피드백", MessageCircle],
                                ["/tools/cover-letter", "자소서 생성기", FilePenLine],
                                ["/tools/review", "자소서 평가", MessageCircle],
                                ["/tools/ai-interviewer", "AI 면접관", Monitor],
                            ].map(([href, label, Icon]) => (
                                <Link key={String(href)} href={String(href)} onClick={(event) => guardLink(String(href), event)} className={sidebarLinkClass()}>
                                    <Icon className="h-4 w-4" />
                                    {String(label)}
                                </Link>
                            ))}
                        </div>
                    )}
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

            <main className="min-h-screen flex-1 px-6 py-4 text-slate-900">
                <div className="mx-auto max-w-[1340px] space-y-5">
                    <header className="grid gap-4 lg:grid-cols-[1fr_380px]">
                        <nav className="flex items-center gap-3 rounded-2xl border border-[#d7e5ff] bg-[#edf4ff] p-3 shadow-sm">
                            <Link href="/" className="flex h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-xl font-extrabold text-[#1764ff]">
                                <Star className="h-5 w-5 fill-[#1764ff]" />
                                자소서빌더
                            </Link>
                            {[
                                ["메인", "/"],
                            ].map(([label, href]) => (
                                <Link key={label} href={href} className="rounded-xl border border-blue-100 bg-white/75 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-white">
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        <Link href="/tools/job-info-ai" className="flex items-center justify-between rounded-2xl border border-[#d7e5ff] bg-white p-3 shadow-sm">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1764ff] text-white">
                                <Search className="h-6 w-6" />
                            </span>
                            <span className="flex-1 px-4">
                                <span className="block text-sm font-extrabold text-slate-900">기업 검색</span>
                                <span className="mt-1 block text-xs text-slate-500">클릭하면 직장 정보 AI로 이동합니다</span>
                            </span>
                            <span className="rounded-xl bg-[#1764ff] px-4 py-2 text-sm font-bold text-white">열기</span>
                        </Link>
                    </header>

                    <section className="rounded-[28px] bg-gradient-to-br from-[#dbe7ff] via-white to-[#f6fbff] p-10 shadow-[0_20px_60px_rgba(43,91,181,0.12)]">
                        <div className="rounded-[28px] border border-[#d7e5ff] bg-white/75 px-8 py-12 text-center">
                            <span className="inline-flex rounded-full bg-blue-50 px-5 py-2 text-sm font-extrabold text-[#1764ff]">
                                AI 취업 워크스페이스
                            </span>
                            <h1 className="mt-7 text-5xl font-black tracking-tight text-slate-950">
                                AI들이 도와주는 취업, <span className="text-[#397df0]">자소서빌더</span>
                            </h1>
                            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-500">
                                채용공고 탐색부터 자소서 작성, 면접 준비까지 검색을 중심으로 바로 이어서 시작할 수 있게 단순하게 정리했습니다.
                            </p>

                            <div className="mx-auto mt-8 flex max-w-[670px] items-center gap-3 rounded-2xl border border-[#d7e5ff] bg-white p-2 shadow-lg">
                                <Search className="ml-3 h-5 w-5 text-[#397df0]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") submitSearch()
                                    }}
                                    placeholder="채용공고, 자소서, 면접 질문을 검색해보세요"
                                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                                />
                                <button type="button" onClick={submitSearch} className="rounded-xl bg-[#397df0] px-7 py-4 text-sm font-extrabold text-white shadow-md">
                                    검색
                                </button>
                            </div>

                            <div className="mt-6 flex justify-center gap-3">
                                {["채용공고 검색", "AI 자소서 초안", "AI 면접 연습"].map((label) => (
                                    <button key={label} type="button" onClick={() => {
                                        localStorage.setItem("pendingJobInfoQuestion", label)
                                        router.push("/tools/job-info-ai")
                                    }} className="rounded-full border border-[#d7e5ff] bg-white px-5 py-2 text-sm font-bold text-slate-600 hover:border-blue-300">
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="mx-auto mt-8 grid max-w-[1040px] grid-cols-1 gap-4 md:grid-cols-3">
                                {mainTools.map((tool) => {
                                    const Icon = tool.icon
                                    return (
                                        <Link key={tool.title} href={tool.href} onClick={(event) => guardLink(tool.href, event)} className="flex items-center gap-4 rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d7e5ff] bg-blue-50">
                                                <Icon className={`h-7 w-7 ${tool.accent}`} />
                                            </span>
                                            <span className="flex-1">
                                                <span className="text-xs font-extrabold text-[#397df0]">{tool.eyebrow}</span>
                                                <span className="mt-1 block text-xl font-black text-slate-950">{tool.title}</span>
                                                <span className="mt-2 block text-sm text-slate-500">{tool.description}</span>
                                            </span>
                                            <span className="text-2xl font-black text-[#397df0]">→</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-[#d7e5ff] bg-white p-9 shadow-sm">
                        <p className="text-sm font-black tracking-[0.2em] text-[#397df0]">ALL TOOLS</p>
                        <h2 className="mt-2 text-3xl font-black text-slate-950">전체 도구 바로가기</h2>
                        <div className="mt-4 h-px bg-[#d7e5ff]" />
                        <div className="mx-auto mt-8 grid max-w-[880px] grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
                            {allTools.map(([label, Icon, href]) => (
                                <Link key={label} href={href} onClick={(event) => guardLink(href, event)} className="group text-center">
                                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d7e5ff] bg-[#f7fbff] shadow-sm group-hover:border-blue-300 group-hover:bg-blue-50">
                                        <Icon className="h-7 w-7 text-[#397df0]" />
                                    </span>
                                    <span className="mt-3 block text-sm font-extrabold text-slate-800">{label}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-5">
                    <div className="relative w-full max-w-[430px] rounded-2xl bg-white px-8 py-8 text-center shadow-2xl">
                        <button type="button" onClick={() => setLoginModalOpen(false)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            ×
                        </button>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2f74ff] text-white shadow-lg">
                            <Lock className="h-9 w-9" />
                        </div>
                        <h2 className="mt-6 text-2xl font-black text-slate-900">로그인이 필요합니다</h2>
                        <p className="mt-4 text-sm leading-6 text-slate-500">이 기능을 사용하려면 로그인이 필요합니다.<br />회원가입 후 다양한 혜택을 누려보세요!</p>
                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <Button type="button" variant="outline" onClick={() => setLoginModalOpen(false)} className="h-12 rounded-lg border-slate-200 bg-white font-bold text-slate-500">취소</Button>
                            <Link href="/login" className="block">
                                <Button type="button" className="h-12 w-full rounded-lg bg-[#2f74ff] font-bold text-white hover:bg-blue-700">
                                    <LogIn className="mr-2 h-4 w-4" /> 로그인하기
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
