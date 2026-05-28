"use client"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
    FileText,
    HelpCircle,
    Users,
    Code2,
    ClipboardCheck,
    Folder,
    Heart,
    Edit,
} from "lucide-react"

export default function MyProfilePage() {
    const router = useRouter()
    return (
        <div className="min-h-screen bg-slate-50 px-6 py-6">
            <div className="mx-auto max-w-6xl space-y-5">
                {/* 상단 탭 */}
                <div className="rounded-xl border bg-white p-2 shadow-sm">
                    <div className="flex items-center justify-between gap-2 overflow-x-auto">
                        {[
                            "내 정보",
                            "내 지원 현황",
                            "받은 면접 제안",
                            "받은 컨택",
                            "관심 채용공고",
                            "내가 쓴 게시글",
                            "컨설팅 요청내역",
                            "구독 내역",
                        ].map((tab, index) => (
                            <button
                                key={tab}
                                className={`shrink-0 rounded-lg px-6 py-3 text-sm font-semibold ${index === 0
                                        ? "bg-blue-600 text-white shadow"
                                        : "text-slate-600 hover:bg-slate-100"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-200 text-xs text-slate-400">
                            성장군
                        </div>
                    </div>
                </div>

                {/* 프로필 카드 */}
                {/* <section className="rounded-xl border bg-white p-0 shadow-sm">
                    <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-blue-500 via-pink-500 to-emerald-400" />

                    <div className="grid grid-cols-[1.4fr_1.2fr] gap-6 p-6">
                        <div className="flex gap-6 border-r pr-8">
                            <div className="relative">
                                <div className="absolute -top-2 left-7 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                                    브론즈
                                </div>

                                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-orange-400 bg-blue-100 shadow">
                                    <User className="h-16 w-16 text-blue-500" />
                                </div>

                                <button className="absolute bottom-2 right-1 rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                                    수정
                                </button>
                            </div>

                            <div className="flex-1">
                                <div className="mb-3 flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-blue-600">
                                        Gh Asd 님
                                    </h1>

                                    <span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-bold text-white">
                                        🏅 브론즈
                                    </span>
                                </div>

                                <div className="mb-3 flex items-center gap-2 rounded-xl border bg-blue-50 px-4 py-3 text-sm text-slate-600">
                                    <Mail className="h-4 w-4 text-blue-500" />
                                    aa96678188@gmail.com
                                </div>

                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex items-center gap-2 rounded-xl border bg-blue-50 px-4 py-3 text-sm text-slate-600">
                                        <User className="h-4 w-4 text-blue-500" />
                                        추천인코드: 6e463364
                                    </div>

                                    <button className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-slate-800">
                                        💬 친구초대
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border bg-blue-50 px-4 py-3">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                                        <Edit className="h-4 w-4" />
                                        닉네임
                                    </span>

                                    <span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-sm text-blue-600">
                                        user_a07eb925
                                    </span>

                                    <button className="ml-auto rounded-lg border bg-white px-4 py-2 text-blue-600">
                                        <Edit className="h-4 w-4" />
                                    </button>

                                    <button className="rounded-lg border bg-white px-4 py-2 text-blue-600">
                                        <Bell className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-5">
                            <InfoCard
                                icon={<Coins className="h-8 w-8 text-blue-600" />}
                                title="보유 토큰"
                                value="8022"
                                action="충전하기"
                            />

                            <InfoCard
                                icon={<Crown className="h-8 w-8 text-blue-600" />}
                                title="구독 상태"
                                value="Basic"
                                action="구독하기"
                            />

                            <InfoCard
                                icon={<Ticket className="h-8 w-8 text-blue-600" />}
                                title="이용권 현황"
                                value="이용권 없음"
                                action="관리하기"
                                green
                            />
                        </div>
                    </div>
                </section> */}

                {/* 저장한 파일 */}
                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900">저장한 파일</h2>
                    <div className="mt-3 h-0.5 w-10 bg-blue-600" />

                    <div className="mt-5 grid grid-cols-3 gap-4">
                        <MenuCard
                            icon={<FileText />}
                            title="이력서 생성기"
                            desc="저장한 이력서를 확인하세요"
                            onClick={() => router.push("/tools/mypage/save-builder-resume")}
                        />
                        <MenuCard
                            icon={<FileText />}
                            title="자소서 생성기"
                            desc="저장한 자기소개서를 확인하세요"
                            onClick={() => router.push("/tools/mypage/save-cover-letter")}
                        />
                        <MenuCard icon={<HelpCircle />} title="면접예상질문" desc="AI로 예상 면접 질문을 준비하세요" />
                        <MenuCard icon={<Users />} title="AI 면접 기록" desc="AI와 면접 연습을 해보세요" />
                        <MenuCard icon={<Code2 />} title="테크트리 생성기" desc="AI로 기술 스택을 분석해보세요" />
                        <MenuCard
                            icon={<ClipboardCheck />}
                            title="자기소개서 평가"
                            desc="저장한 평가 결과를 확인하세요"
                            onClick={() => router.push("/tools/mypage/save-cover-letter-review")}
                        />
                        <MenuCard
                            icon={<Folder />}
                            title="경험 저장소"
                            desc="자소서에 활용할 경험을 관리하세요"
                            green
                        />
                    </div>
                </section>

                {/* 활동 기록 */}
                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900">📊활동 기록</h2>

                    <div className="mt-5 grid grid-cols-2 gap-5">
                        <ActivityCard
                            icon={<Heart />}
                            title="관심 채용공고"
                            desc="관심등록한 채용공고를 확인해보세요"
                        />

                        <ActivityCard
                            icon={<Edit />}
                            title="내가 쓴 게시글"
                            desc="커뮤니티에 작성한 게시글을 확인해보세요"
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}

function MenuCard({
    icon,
    title,
    desc,
    green,
    onClick,
}: {
    icon: ReactNode
    title: string
    desc: string
    green?: boolean
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-2xl border bg-white p-5 text-left shadow-sm hover:border-blue-400 hover:bg-blue-50"
        >
            <div className={green ? "text-emerald-500" : "text-blue-600"}>
                {icon}
            </div>
            <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
        </button>
    )
}

function ActivityCard({
    icon,
    title,
    desc,
}: {
    icon: React.ReactNode
    title: string
    desc: string
}) {
    return (
        <div className="flex items-center gap-5 rounded-2xl border bg-slate-100 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500 text-white shadow">
                {icon}
            </div>

            <div>
                <div className="text-lg font-bold text-slate-900">{title}</div>
                <div className="mt-1 text-sm text-slate-500">
                    {desc}
                    <span className="ml-2 rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white">
                        0개
                    </span>
                </div>
            </div>
        </div>
    )
}
