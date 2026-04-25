"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
    User,
    GraduationCap,
    Briefcase,
    Wrench,
    Award,
    Trophy,
    Search,
    Code2,
    Smartphone,
    Database,
    Cloud,
    Gamepad2,
    Shield,
    Palette,
    Bug,
    FolderKanban,
    Megaphone,
    Handshake,
    Users,
    Calculator,
    Scale,
    Factory,
    Truck,
    HeartPulse,
    BookOpen,
    Clapperboard,
    Headphones,
    Landmark,
    Home,
    Sparkles,
    Dumbbell,
    Languages,
    Music,
    Leaf,
    Cpu,
    Info,
    X,
    Save,
    ChevronLeft,
    ChevronRight,
    Rocket,
} from "lucide-react"

const tabs = [
    "기본정보",
    "학력사항",
    "경력사항",
    "보유기술",
    "자격증",
    "수상경력",
]

const SCHOOL_OPTIONS = [
    "서울대학교",
    "연세대학교",
    "고려대학교",
    "성균관대학교",
    "한양대학교",
    "중앙대학교",
    "경희대학교",
    "부산대학교",
    "동아대학교",
    "동의대학교",
]

const MAJOR_OPTIONS = [
    "컴퓨터공학과",
    "소프트웨어공학과",
    "인공지능학과",
    "전자공학과",
    "경영학과",
    "경제학과",
]

const DEGREE_OPTIONS = [
    "고등학교졸업",
    "전문학사",
    "학사",
    "석사",
    "박사",
]

const STATUS_OPTIONS = [
    "졸업",
    "졸업예정",
    "재학중",
    "수료",
    "중퇴",
]

const COMPANY_OPTIONS = [
    "삼성전자",
    "LG전자",
    "네이버",
    "카카오",
    "쿠팡",
    "배달의민족",
    "토스",
    "라인",
    "SK하이닉스",
    "현대자동차",
    "CJ올리브영",
    "당근",
    "야놀자",
    "직방",
    "우아한형제들",
]

const GPA_SCALE_OPTIONS = ["4.0", "4.3", "4.5", "100"]

type EducationItem = {
    schoolName: string
    major: string
    degree: string
    status: string
    gpa: string
    gpaScale: string
    admissionDate: string
    graduationDate: string
    extraInfo: string
}

type CareerItem = {
    companyName: string
    position: string
    startDate: string
    endDate: string
    isCurrent: boolean
    description: string
}

type SkillGroupItem = {
    category: string
    skills: string[]
}

type CertificateItem = {
    name: string
    issuer: string
    grade: string
    acquiredDate: string
    expiryDate: string
    noExpiry: boolean
}

type AwardItem = {
    title: string
    organization: string
    description: string
    date: string
}

const SKILL_CATEGORIES = [
    {
        group: "웹/앱 개발",
        icon: Code2,
        items: ["프론트엔드", "백엔드", "풀스택"],
    },
    {
        group: "모바일 개발",
        icon: Smartphone,
        items: ["모바일 - 네이티브", "모바일 - 크로스플랫폼", "모바일 - 하이브리드"],
    },
    {
        group: "데이터 & AI",
        icon: Database,
        items: ["데이터베이스", "데이터 엔지니어링", "데이터 분석", "머신러닝/AI", "빅데이터"],
    },
    {
        group: "인프라 & 클라우드",
        icon: Cloud,
        items: ["클라우드 서비스", "데브옵스/CI/CD", "인프라/서버", "컨테이너/오케스트레이션"],
    },
    {
        group: "프로그래밍",
        icon: Code2,
        items: ["프로그래밍 언어", "스크립트 언어", "Web Assembly"],
    },
    {
        group: "게임 & 멀티미디어",
        icon: Gamepad2,
        items: ["게임 엔진", "게임 개발", "VR/AR"],
    },
    {
        group: "보안 & 블록체인",
        icon: Shield,
        items: ["보안", "블록체인", "암호화"],
    },
    {
        group: "디자인 & 크리에이티브",
        icon: Palette,
        items: ["UI/UX 디자인", "그래픽 디자인", "3D/모델링", "영상/애니메이션", "웹디자인", "브랜드 디자인"],
    },
    {
        group: "테스트 & 품질관리",
        icon: Bug,
        items: ["테스트/QA", "성능 최적화", "모니터링/로깅"],
    },
    {
        group: "협업 & 관리도구",
        icon: FolderKanban,
        items: ["프로젝트 관리", "협업 도구", "문서화 도구", "버전 관리"],
    },
    {
        group: "마케팅 & 광고",
        icon: Megaphone,
        items: ["디지털 마케팅", "SNS 마케팅", "콘텐츠 마케팅", "퍼포먼스 마케팅", "브랜드 마케팅", "CRM/이메일 마케팅"],
    },
    {
        group: "영업 & 세일즈",
        icon: Handshake,
        items: ["B2B 영업", "B2C 영업", "온라인 영업", "텔레세일즈", "영업 관리", "고객 관리"],
    },
    {
        group: "인사 & HR",
        icon: Users,
        items: ["채용/리크루팅", "인사 관리", "교육/연수", "급여/복리후생", "노무/법무", "조직 개발"],
    },
    {
        group: "재무 & 회계",
        icon: Calculator,
        items: ["회계", "세무", "재무 분석", "예산 관리", "투자 분석", "IR/공시"],
    },
    {
        group: "법무 & 컨설팅",
        icon: Scale,
        items: ["계약/법무", "지적재산권", "규제/컴플라이언스", "경영 컨설팅", "전략 기획"],
    },
    {
        group: "제조 & 생산",
        icon: Factory,
        items: ["생산 관리", "품질 관리", "공정 개선", "설비 관리", "안전 관리", "SCM/구매"],
    },
    {
        group: "물류 & SCM",
        icon: Truck,
        items: ["물류 관리", "재고 관리", "운송 관리", "창고 관리", "수출입", "유통"],
    },
    {
        group: "의료 & 헬스케어",
        icon: HeartPulse,
        items: ["의료 서비스", "간호", "약학", "의료 기기", "헬스케어 IT", "의료 연구"],
    },
    {
        group: "교육 & 강의",
        icon: BookOpen,
        items: ["강의/교육", "교육과정 개발", "e-러닝", "교육 컨설팅", "학습 설계"],
    },
    {
        group: "미디어 & 콘텐츠",
        icon: Clapperboard,
        items: ["콘텐츠 제작", "방송/영상", "출판/편집", "카피라이팅"],
    },
    {
        group: "서비스업",
        icon: Headphones,
        items: ["고객 서비스", "호텔/숙박", "외식/F&B", "여행/관광", "이벤트 기획"],
    },
    {
        group: "금융 & 투자",
        icon: Landmark,
        items: ["은행/금융", "보험", "증권/투자", "핀테크", "자산 관리", "대출/신용"],
    },
    {
        group: "부동산",
        icon: Home,
        items: ["부동산 중개", "부동산 개발", "시설 관리", "건설/시공", "인테리어"],
    },
    {
        group: "뷰티 & 패션",
        icon: Sparkles,
        items: ["뷰티/화장품", "패션 디자인", "스타일링", "헤어/네일", "패션 머천다이징"],
    },
    {
        group: "스포츠 & 피트니스",
        icon: Dumbbell,
        items: ["피트니스 트레이닝", "스포츠 지도", "재활/물리치료", "스포츠 마케팅"],
    },
    {
        group: "언어 & 국제",
        icon: Languages,
        items: ["번역/통역", "어학 교육", "국제 업무", "해외 진출"],
    },
    {
        group: "예술 & 문화",
        icon: Music,
        items: ["공연/연기", "음악", "미술", "문화 기획", "박물관/갤러리"],
    },
    {
        group: "농업 & 환경",
        icon: Leaf,
        items: ["농업/원예", "환경 관리", "에너지", "지속가능성", "친환경"],
    },
    {
        group: "기타 전문분야",
        icon: Cpu,
        items: ["IoT/임베디드", "네트워킹", "시스템 프로그래밍", "자동화/스크립팅", "기타"],
    },
]

function AutoCompleteInput({
    label,
    placeholder,
    value,
    options,
    onChange,
    required = false,
}: {
    label: string
    placeholder: string
    value: string
    options: string[]
    onChange: (value: string) => void
    required?: boolean
}) {
    const [open, setOpen] = useState(false)

    const filtered = options.filter(
        (item) =>
            value.trim() !== "" &&
            item.toLowerCase().includes(value.toLowerCase())
    )

    return (
        <div className="relative">
            <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                {label}
                {required && " *"}
            </label>

            <Input
                className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    const next = e.target.value
                    onChange(next)
                    setOpen(next.trim().length > 0)
                }}
                onFocus={() => {
                    if (value.trim().length > 0) setOpen(true)
                }}
                onBlur={() => {
                    setTimeout(() => setOpen(false), 150)
                }}
            />

            {open && filtered.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                    {filtered.map((item) => (
                        <button
                            key={item}
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                onChange(item)
                                setOpen(false)
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}


export default function ResumeBuilderPage() {
    const [activeTab, setActiveTab] = useState("기본정보")
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const defaultFormData = {
        resumeTitle: "",
        name: "",
        email: "",
        phone: "",
        school: "",
        company: "",
        skills: [] as string[],
        education: [] as EducationItem[],
        career: [] as CareerItem[],
        skillGroups: [] as SkillGroupItem[],
        certificates: [] as CertificateItem[],
        awards: [] as AwardItem[],
    }

    const [formData, setFormData] = useState(defaultFormData)
    const [isMounted, setIsMounted] = useState(false)

    const [skillModalOpen, setSkillModalOpen] = useState(false)
    const [skillModalSearch, setSkillModalSearch] = useState("")
    const [selectedSkillGroupIndex, setSelectedSkillGroupIndex] =
        useState<number | null>(null)

    const [skillSearchModalOpen, setSkillSearchModalOpen] = useState(false)
    const [skillSearchKeyword, setSkillSearchKeyword] = useState("")
    const [selectedSkillSearchGroupIndex, setSelectedSkillSearchGroupIndex] =
        useState<number | null>(null)

    const [previewModalOpen, setPreviewModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")

    useEffect(() => {
        const saved = localStorage.getItem("resumeData")
        if (saved) {
            setFormData(JSON.parse(saved))
        }
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted) return
        localStorage.setItem("resumeData", JSON.stringify(formData))
    }, [formData, isMounted])

    const progress = useMemo(() => {
        if (!isMounted) return 0

        let score = 0

        if (formData.resumeTitle.trim()) score += 10

        if (formData.name.trim()) score += 20
        if (formData.email.trim()) score += 20
        if (formData.phone.trim()) score += 10

        if (formData.education.length > 0) score += 20
        if (formData.education.some((edu) => edu.schoolName.trim())) score += 20
        if (formData.education.some((edu) => edu.major.trim())) score += 10

        if (formData.career.length > 0) score += 20
        if (formData.career.some((career) => career.companyName.trim())) score += 20

        if (formData.skillGroups.length > 0) score += 20
        if (formData.skillGroups.some((group) => group.category.trim())) score += 10
        if (formData.skillGroups.some((group) => group.skills.length > 0)) score += 20

        if (formData.certificates.length > 0) score += 10
        if (formData.awards.length > 0) score += 10

        return Math.min(score, 200)
    }, [formData, isMounted])

    const currentStep = tabs.indexOf(activeTab)
    const totalSteps = tabs.length
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === totalSteps - 1

    const iconMap: Record<string, ReactNode> = {
        기본정보: <User size={16} />,
        학력사항: <GraduationCap size={16} />,
        경력사항: <Briefcase size={16} />,
        보유기술: <Wrench size={16} />,
        자격증: <Award size={16} />,
        수상경력: <Trophy size={16} />,
    }

    const createEmptyEducation = (): EducationItem => ({
        schoolName: "",
        major: "",
        degree: "학사",
        status: "졸업",
        gpa: "",
        gpaScale: "4.3",
        admissionDate: "",
        graduationDate: "",
        extraInfo: "",
    })

    const createEmptyCareer = (): CareerItem => ({
        companyName: "",
        position: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
    })

    const createEmptySkillGroup = (): SkillGroupItem => ({
        category: "",
        skills: [],
    })

    const createEmptyCertificate = (): CertificateItem => ({
        name: "",
        issuer: "",
        grade: "",
        acquiredDate: "",
        expiryDate: "",
        noExpiry: false,
    })

    const createEmptyAward = (): AwardItem => ({
        title: "",
        organization: "",
        description: "",
        date: "",
    })

    const updateEducationField = (
        index: number,
        field: keyof EducationItem,
        value: string
    ) => {
        setFormData((prev) => {
            const next = [...prev.education]
            next[index] = { ...next[index], [field]: value }
            return { ...prev, education: next }
        })
    }

    const addEducation = () => {
        setFormData((prev) => ({
            ...prev,
            education: [...prev.education, createEmptyEducation()],
        }))
    }

    const removeEducation = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index),
        }))
    }

    const updateCareerField = (
        index: number,
        field: keyof CareerItem,
        value: string | boolean
    ) => {
        setFormData((prev) => {
            const next = [...prev.career]
            next[index] = { ...next[index], [field]: value }
            return { ...prev, career: next }
        })
    }

    const addCareer = () => {
        setFormData((prev) => ({
            ...prev,
            career: [...prev.career, createEmptyCareer()],
        }))
    }

    const removeCareer = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            career: prev.career.filter((_, i) => i !== index),
        }))
    }

    const updateSkillGroupField = (
        index: number,
        field: keyof SkillGroupItem,
        value: string | string[]
    ) => {
        setFormData((prev) => {
            const next = [...prev.skillGroups]
            next[index] = { ...next[index], [field]: value }
            return { ...prev, skillGroups: next }
        })
    }

    const addSkillGroup = () => {
        setFormData((prev) => ({
            ...prev,
            skillGroups: [...prev.skillGroups, createEmptySkillGroup()],
        }))
    }

    const removeSkillGroup = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            skillGroups: prev.skillGroups.filter((_, i) => i !== index),
        }))
    }

    const openSkillCategoryModal = (index: number) => {
        setSelectedSkillGroupIndex(index)
        setSkillSearchModalOpen(false)
        setSkillModalSearch("")
        setSkillModalOpen(true)
    }

    const filteredSkillCategories = SKILL_CATEGORIES.map((section) => ({
        ...section,
        items: section.items.filter((item) =>
            item.toLowerCase().includes(skillModalSearch.toLowerCase())
        ),
    })).filter(
        (section) => section.items.length > 0 || skillModalSearch.trim() === ""
    )

    const openSkillSearchModal = (index: number) => {
        setSelectedSkillSearchGroupIndex(index)
        setSkillModalOpen(false)
        setSkillSearchKeyword("")
        setSkillSearchModalOpen(true)
    }

    const addSkillToGroup = (index: number, skill: string) => {
        const normalized = skill.trim()
        if (!normalized) return

        setFormData((prev) => {
            const next = [...prev.skillGroups]
            const currentSkills = next[index].skills ?? []

            if (currentSkills.includes(normalized)) return prev

            next[index] = {
                ...next[index],
                skills: [...currentSkills, normalized],
            }

            return { ...prev, skillGroups: next }
        })
    }

    const removeSkillFromGroup = (groupIndex: number, skill: string) => {
        setFormData((prev) => {
            const next = [...prev.skillGroups]
            next[groupIndex] = {
                ...next[groupIndex],
                skills: next[groupIndex].skills.filter((item) => item !== skill),
            }
            return { ...prev, skillGroups: next }
        })
    }

    const handleDirectAddSkill = () => {
        if (selectedSkillSearchGroupIndex === null) return

        const value = skillSearchKeyword.trim()
        if (!value) return

        addSkillToGroup(selectedSkillSearchGroupIndex, value)
        setSkillSearchKeyword("")
        setSkillSearchModalOpen(false)
    }

    const updateCertificateField = (
        index: number,
        field: keyof CertificateItem,
        value: string | boolean
    ) => {
        setFormData((prev) => {
            const next = [...prev.certificates]
            next[index] = { ...next[index], [field]: value }
            return { ...prev, certificates: next }
        })
    }

    const addCertificate = () => {
        setFormData((prev) => ({
            ...prev,
            certificates: [...prev.certificates, createEmptyCertificate()],
        }))
    }

    const removeCertificate = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            certificates: prev.certificates.filter((_, i) => i !== index),
        }))
    }

    const updateAwardField = (
        index: number,
        field: keyof AwardItem,
        value: string
    ) => {
        setFormData((prev) => {
            const next = [...prev.awards]
            next[index] = { ...next[index], [field]: value }
            return { ...prev, awards: next }
        })
    }

    const addAward = () => {
        setFormData((prev) => ({
            ...prev,
            awards: [...prev.awards, createEmptyAward()],
        }))
    }

    const removeAward = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            awards: prev.awards.filter((_, i) => i !== index),
        }))
    }

    const goPrevStep = () => {
        if (!isFirstStep) setActiveTab(tabs[currentStep - 1])
    }

    const goNextStep = () => {
        if (!isLastStep) setActiveTab(tabs[currentStep + 1])
    }

    const handleTempSave = () => {
        localStorage.setItem("resumeData", JSON.stringify(formData))
        alert("임시저장되었습니다.")
    }

    const handlePreview = () => {
        setPreviewModalOpen(true)
    }

    const confirmPreview = () => {
        localStorage.setItem("resumeData", JSON.stringify(formData))
        setPreviewModalOpen(false)
        setViewMode("preview")
    }

    const handleSaveResume = () => {
        const ok = window.confirm(
            "이력서를 저장하시겠습니까?\n저장 후에도 언제든지 수정할 수 있습니다."
        )

        if (!ok) return

        localStorage.setItem("savedResume", JSON.stringify(formData))
        window.location.href = "/my-info"
    }

    return (
        <div className="relative min-h-screen">
            {viewMode === "preview" ? (
                <div className="min-h-screen bg-slate-100">
                    <div className="sticky top-0 z-40 border-b bg-white">
                        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    이력서 미리보기
                                </h1>
                                <p className="text-sm text-slate-500">
                                    템플릿과 설정을 확인한 후 저장하세요
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setViewMode("edit")}
                                >
                                    ← 되돌아가기
                                </Button>

                                <Button
                                    type="button"
                                    className="bg-emerald-500 text-white hover:bg-emerald-600"
                                    onClick={handleSaveResume}
                                >
                                    저장하기
                                </Button>

                                <Button
                                    type="button"
                                    className="bg-red-500 text-white hover:bg-red-600"
                                >
                                    고품질 PDF
                                </Button>

                                <Button variant="outline" type="button">
                                    워드 내보내기
                                </Button>

                                <Button variant="outline" type="button" disabled>
                                    브라우저 인쇄
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto max-w-5xl px-6 py-6">
                        <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl border bg-white p-4">
                            <div className="rounded-lg border p-4">
                                <div className="text-xs text-slate-400">템플릿</div>
                                <div className="mt-1 font-semibold">모던</div>
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="text-xs text-slate-400">색상</div>
                                <div className="mt-1 flex items-center gap-2 font-semibold">
                                    <span className="h-3 w-3 rounded-full bg-blue-600" />
                                    블루
                                </div>
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="text-xs text-slate-400">글꼴</div>
                                <div className="mt-1 font-semibold">모던</div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-200 p-8">
                            <div className="space-y-6">
                                <section className="rounded-2xl bg-white p-8 shadow-sm">
                                    <div className="flex justify-between">
                                        <div>
                                            <h2 className="text-5xl font-bold text-blue-600">
                                                {formData.name || "이름 미입력"}
                                            </h2>
                                            <div className="mt-4 h-1 w-20 bg-blue-600" />
                                            <p className="mt-4 text-sm text-slate-600">
                                                {formData.email} · {formData.phone}
                                            </p>
                                        </div>

                                        <div className="text-xs text-slate-400">
                                            이미지 없음
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-2xl bg-white p-8 shadow-sm">
                                    <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">
                                        교육
                                    </h3>

                                    {formData.education.length === 0 ? (
                                        <p className="text-sm text-slate-400">입력된 학력이 없습니다.</p>
                                    ) : (
                                        formData.education.map((edu, index) => (
                                            <div key={index} className="mb-4">
                                                <div className="font-bold">
                                                    {edu.schoolName}
                                                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                                        {edu.admissionDate} - {edu.graduationDate || "현재"}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-slate-700">{edu.major}</div>
                                                <div className="mt-1 text-sm text-slate-500">{edu.status}</div>
                                            </div>
                                        ))
                                    )}
                                </section>

                                <section className="rounded-2xl bg-white p-8 shadow-sm">
                                    <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">
                                        경력
                                    </h3>

                                    {formData.career.length === 0 ? (
                                        <p className="text-sm text-slate-400">입력된 경력이 없습니다.</p>
                                    ) : (
                                        formData.career.map((career, index) => (
                                            <div key={index} className="mb-4">
                                                <div className="font-bold">
                                                    {career.companyName}
                                                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                                        {career.startDate} -{" "}
                                                        {career.isCurrent ? "현재" : career.endDate}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-slate-700">{career.position}</div>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    {career.description}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </section>

                                <section className="rounded-2xl bg-white p-8 shadow-sm">
                                    <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">
                                        기술
                                    </h3>

                                    {formData.skillGroups.length === 0 ? (
                                        <p className="text-sm text-slate-400">입력된 기술이 없습니다.</p>
                                    ) : (
                                        formData.skillGroups.map((group, index) => (
                                            <div key={index} className="mb-4">
                                                <div className="font-bold">{group.category}</div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {group.skills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="rounded-full bg-blue-600 px-3 py-1 text-xs text-white"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </section>

                                <section className="rounded-2xl bg-white p-8 shadow-sm">
                                    <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">
                                        자격증
                                    </h3>

                                    {formData.certificates.length === 0 ? (
                                        <p className="text-sm text-slate-400">입력된 자격증이 없습니다.</p>
                                    ) : (
                                        formData.certificates.map((cert, index) => (
                                            <div key={index} className="mb-4">
                                                <div className="font-bold">
                                                    {cert.name}
                                                    {cert.grade && (
                                                        <span className="ml-2 rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                                                            {cert.grade}
                                                        </span>
                                                    )}
                                                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                                        {cert.acquiredDate}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-slate-600">{cert.issuer}</div>
                                            </div>
                                        ))
                                    )}
                                </section>

                                <section className="rounded-2xl bg-white p-8 shadow-sm">
                                    <h3 className="mb-5 text-2xl font-bold text-blue-600 underline">
                                        수상경력
                                    </h3>

                                    {formData.awards.length === 0 ? (
                                        <p className="text-sm text-slate-400">입력된 수상경력이 없습니다.</p>
                                    ) : (
                                        formData.awards.map((award, index) => (
                                            <div key={index} className="mb-4">
                                                <div className="font-bold">
                                                    {award.title}
                                                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                                        {award.date}
                                                    </span>
                                                </div>
                                                <div className="mt-1 text-slate-600">
                                                    {award.organization}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                <div className="max-w-5xl mx-auto space-y-6">
                    <Card className="rounded-2xl border border-slate-200 shadow-sm">
                        <CardContent className="p-7">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900">이력서 작성</h2>
                                    <p className="mt-3 text-sm text-slate-500">
                                        단계별로 차근차근 완성해보세요
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex h-[74px] w-[118px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                                        <div className="text-3xl font-bold text-blue-600">
                                            {progress}%
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500">완성률</div>
                                    </div>

                                    <div className="flex h-[74px] w-[118px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                                        <div className="text-lg font-bold text-slate-900">
                                            {progress >= 100 ? "완성" : "작성중"}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500">진행상태</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                                이력서 제목&nbsp;
                                <span className="font-bold">
                                    {formData.resumeTitle || "미입력"}
                                </span>
                            </div>
                            <div className="mt-8 h-2 w-full rounded-full bg-slate-200">
                                <div
                                    className="h-2 rounded-full bg-emerald-500 transition-all"
                                    style={{ width: `${Math.min(progress / 2, 100)}%` }}
                                />
                            </div>

                            <div className="mt-5 flex h-14 items-center justify-between rounded-xl border border-slate-200 bg-white px-5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <span className="text-slate-400 text-lg">📄</span>

                                    <input
                                        value={formData.resumeTitle}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                resumeTitle: e.target.value,
                                            })
                                        }
                                        placeholder="이력서 제목을 입력해주세요"
                                        maxLength={50}
                                        className="w-full bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="ml-4 shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500">
                                    {formData.resumeTitle.length}/50
                                </div>
                            </div>

                            {progress >= 100 && (
                                <div className="mt-5 flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                                        🎉
                                    </div>

                                    <div>
                                        <div className="font-bold text-emerald-700">
                                            축하합니다! 이력서가 거의 완성되었습니다.
                                        </div>
                                        <div className="mt-1 text-sm text-emerald-700">
                                            이제 저장하고 활용해보세요!
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-3">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab

                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${isActive
                                                    ? "bg-blue-100 text-blue-600 font-medium"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }`}
                                        >
                                            {iconMap[tab]}
                                            {tab}
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="min-h-[500px]">
                        <CardContent className="p-6">
                            {activeTab === "기본정보" && (
                                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-40 rounded-md border bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                            사진 추가
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                        />

                                        <Button
                                            className="w-full mt-4"
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            사진 업로드
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">이름 *</label>
                                            <Input
                                                className="mt-2"
                                                placeholder="이름을 입력하세요"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">이메일 *</label>
                                            <Input
                                                className="mt-2"
                                                placeholder="이메일을 입력하세요"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">전화번호 *</label>
                                            <Input
                                                className="mt-2"
                                                placeholder="전화번호를 입력하세요"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, phone: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">주소</label>
                                            <Input className="mt-2" placeholder="주소를 입력하세요" />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">생년월일 *</label>
                                            <Input className="mt-2" type="date" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "학력사항" && (
                                <Card className="rounded-2xl border border-slate-200 shadow-none">
                                    <CardContent className="p-6">
                                        <div className="mb-5">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-sky-500" />
                                                <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                                                    학력사항
                                                </h3>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                학력사항을 시간순(최신순)으로 입력해주세요. 드래그하여 순서를 변경할 수 있습니다.
                                            </p>
                                        </div>

                                        {formData.education.length === 0 && (
                                            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-center">
                                                <GraduationCap className="mb-4 h-12 w-12 text-slate-300" />
                                                <p className="text-xl font-semibold text-slate-700">
                                                    아직 학력사항이 없습니다
                                                </p>
                                                <p className="mt-2 text-sm text-slate-400">
                                                    첫 번째 학력을 추가해보세요
                                                </p>
                                            </div>
                                        )}

                                        {formData.education.length > 0 && (
                                            <div className="space-y-5">
                                                {formData.education.map((edu, index) => (
                                                    <div
                                                        key={index}
                                                        className="overflow-visible rounded-xl border border-slate-200 bg-white"
                                                    >
                                                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-slate-400">⋮⋮</div>
                                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                    <GraduationCap className="h-4 w-4 text-sky-500" />
                                                                    학력 {index + 1}
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeEducation(index)}
                                                                className="text-sm text-slate-400 hover:text-red-500"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>

                                                        <div className="space-y-5 p-5">
                                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                                <AutoCompleteInput
                                                                    label="학교명"
                                                                    required
                                                                    placeholder="학교명을 입력하세요"
                                                                    value={edu.schoolName}
                                                                    options={SCHOOL_OPTIONS}
                                                                    onChange={(value) =>
                                                                        updateEducationField(
                                                                            index,
                                                                            "schoolName",
                                                                            value
                                                                        )
                                                                    }
                                                                />

                                                                <AutoCompleteInput
                                                                    label="전공"
                                                                    required
                                                                    placeholder="전공을 입력하세요"
                                                                    value={edu.major}
                                                                    options={MAJOR_OPTIONS}
                                                                    onChange={(value) =>
                                                                        updateEducationField(index, "major", value)
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        학위
                                                                    </label>
                                                                    <select
                                                                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
                                                                        value={edu.degree}
                                                                        onChange={(e) =>
                                                                            updateEducationField(
                                                                                index,
                                                                                "degree",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    >
                                                                        {DEGREE_OPTIONS.map((item) => (
                                                                            <option key={item} value={item}>
                                                                                {item}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        상태
                                                                    </label>
                                                                    <select
                                                                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
                                                                        value={edu.status}
                                                                        onChange={(e) =>
                                                                            updateEducationField(
                                                                                index,
                                                                                "status",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    >
                                                                        {STATUS_OPTIONS.map((item) => (
                                                                            <option key={item} value={item}>
                                                                                {item}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                    학점(선택)
                                                                </label>

                                                                <div className="flex items-center gap-3">
                                                                    <Input
                                                                        className="h-11 max-w-[220px] border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        placeholder="3.8"
                                                                        value={edu.gpa}
                                                                        onChange={(e) =>
                                                                            updateEducationField(
                                                                                index,
                                                                                "gpa",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />

                                                                    <span className="text-xl text-slate-400">
                                                                        /
                                                                    </span>

                                                                    <select
                                                                        className="h-11 min-w-[92px] rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
                                                                        value={edu.gpaScale}
                                                                        onChange={(e) =>
                                                                            updateEducationField(
                                                                                index,
                                                                                "gpaScale",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    >
                                                                        {GPA_SCALE_OPTIONS.map((item) => (
                                                                            <option key={item} value={item}>
                                                                                {item}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        입학일 *
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        type="date"
                                                                        value={edu.admissionDate}
                                                                        onChange={(e) =>
                                                                            updateEducationField(
                                                                                index,
                                                                                "admissionDate",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        졸업일
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        type="date"
                                                                        value={edu.graduationDate}
                                                                        onChange={(e) =>
                                                                            updateEducationField(
                                                                                index,
                                                                                "graduationDate",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={addEducation}
                                            className="mb-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-base font-semibold text-white shadow-sm hover:opacity-95"
                                        >
                                            + 학력 추가하기
                                        </button>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "경력사항" && (
                                <Card className="rounded-2xl border border-slate-200 shadow-none">
                                    <CardContent className="p-6">
                                        <div className="mb-5">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-blue-500" />
                                                <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                                                    경력사항
                                                </h3>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                경력사항을 시간순(최신순)으로 입력해주세요. 드래그하여 순서를 변경할 수 있습니다.
                                            </p>
                                        </div>

                                        {formData.career.length === 0 && (
                                            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-center">
                                                <Briefcase className="mb-4 h-12 w-12 text-slate-300" />
                                                <p className="text-xl font-semibold text-slate-700">
                                                    아직 경력사항이 없습니다
                                                </p>
                                                <p className="mt-2 text-sm text-slate-400">
                                                    첫 번째 경력을 추가해보세요
                                                </p>
                                            </div>
                                        )}

                                        {formData.career.length > 0 && (
                                            <div className="space-y-5">
                                                {formData.career.map((career, index) => (
                                                    <div
                                                        key={index}
                                                        className="overflow-visible rounded-xl border border-slate-200 bg-white"
                                                    >
                                                        {/* 상단 헤더 */}
                                                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-slate-400">⋮⋮</div>
                                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                    <Briefcase className="h-4 w-4 text-blue-500" />
                                                                    경력 {index + 1}
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeCareer(index)}
                                                                className="text-sm text-slate-400 hover:text-red-500"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>

                                                        {/* 본문 */}
                                                        <div className="space-y-5 p-5">
                                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                                <AutoCompleteInput
                                                                    label="회사명"
                                                                    required
                                                                    placeholder="회사명을 입력하세요"
                                                                    value={career.companyName}
                                                                    options={COMPANY_OPTIONS}
                                                                    onChange={(value) =>
                                                                        updateCareerField(index, "companyName", value)
                                                                    }
                                                                />

                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        직책 *
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        placeholder="직책을 입력하세요"
                                                                        value={career.position}
                                                                        onChange={(e) =>
                                                                            updateCareerField(index, "position", e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1fr_auto]">
                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        시작일 *
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        type="date"
                                                                        value={career.startDate}
                                                                        onChange={(e) =>
                                                                            updateCareerField(index, "startDate", e.target.value)
                                                                        }
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        종료일
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        type="date"
                                                                        value={career.endDate}
                                                                        onChange={(e) =>
                                                                            updateCareerField(index, "endDate", e.target.value)
                                                                        }
                                                                        disabled={career.isCurrent}
                                                                    />
                                                                </div>

                                                                <div className="flex items-end">
                                                                    <Button
                                                                        type="button"
                                                                        variant={career.isCurrent ? "default" : "outline"}
                                                                        className="h-11 px-4"
                                                                        onClick={() =>
                                                                            updateCareerField(index, "isCurrent", !career.isCurrent)
                                                                        }
                                                                    >
                                                                        재직중
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                                                                    <span className="text-blue-500">ⓘ</span>
                                                                    담당업무 및 성과
                                                                </div>

                                                                <textarea
                                                                    className="min-h-[110px] w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:ring-1 focus:ring-sky-500"
                                                                    placeholder={`주요 담당업무와 성과를 구체적으로 작성해주세요
예) • 사용자 경험 개선으로 전환율 15% 향상
• React 기반 웹 애플리케이션 개발 및 유지보수`}
                                                                    value={career.description}
                                                                    onChange={(e) =>
                                                                        updateCareerField(index, "description", e.target.value)
                                                                    }
                                                                />

                                                                <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                                                    구체적인 수치와 성과를 포함하여 작성하면 더 좋습니다
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={addCareer}
                                            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-base font-semibold text-white shadow-sm hover:opacity-95"
                                        >
                                            + 경력 추가하기
                                        </button>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "보유기술" && (
                                <Card className="rounded-2xl border border-slate-200 shadow-none">
                                    <CardContent className="p-6">
                                        <div className="mb-5">
                                            <div className="flex items-center gap-2">
                                                <Wrench className="h-4 w-4 text-cyan-500" />
                                                <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                                                    보유 기술
                                                </h3>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                보유하고 있는 기술을 카테고리별로 정리해주세요. 드래그하여 순서를 변경할 수 있습니다.
                                            </p>
                                        </div>

                                        {formData.skillGroups.length === 0 && (
                                            <div className="rounded-xl border border-slate-200 bg-white p-6">
                                                <button
                                                    type="button"
                                                    onClick={addSkillGroup}
                                                    className="mb-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-base font-semibold text-white shadow-sm hover:opacity-95"
                                                >
                                                    + 스킬 그룹 추가하기
                                                </button>

                                                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                                                    <Wrench className="mb-4 h-12 w-12 text-slate-300" />
                                                    <p className="text-xl font-semibold text-slate-700">
                                                        아직 기술 스택이 없습니다
                                                    </p>
                                                    <p className="mt-2 text-sm text-slate-400">
                                                        첫 번째 스킬 그룹을 추가해보세요
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {formData.skillGroups.length > 0 && (
                                            <div className="space-y-5">
                                                {formData.skillGroups.map((group, index) => (
                                                    <div
                                                        key={index}
                                                        className="overflow-visible rounded-xl border border-slate-200 bg-white"
                                                    >
                                                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-slate-400">⋮⋮</div>
                                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                    <Wrench className="h-4 w-4 text-cyan-500" />
                                                                    스킬 {index + 1}
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeSkillGroup(index)}
                                                                className="text-sm text-slate-400 hover:text-red-500"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>

                                                        <div className="space-y-5 p-5">
                                                            <div>
                                                                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                    카테고리 *
                                                                </label>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openSkillCategoryModal(index)}
                                                                    className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-500 hover:bg-slate-50"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Wrench className="h-4 w-4 text-cyan-500" />
                                                                        <span>
                                                                            {group.category || "카테고리를 선택하세요"}
                                                                        </span>
                                                                    </div>
                                                                    <Search className="h-4 w-4 text-slate-400" />
                                                                </button>
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                    스킬 목록 *
                                                                </label>

                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openSkillSearchModal(index)}
                                                                        className="flex h-11 flex-1 items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-400 hover:bg-slate-50"
                                                                    >
                                                                        클릭하여 스킬 검색 및 추가
                                                                    </button>

                                                                    <Button
                                                                        type="button"
                                                                        className="h-11 px-4 bg-blue-500 hover:bg-blue-600"
                                                                        onClick={() => openSkillSearchModal(index)}
                                                                    >
                                                                        <Search className="h-4 w-4" />
                                                                    </Button>
                                                                </div>

                                                                {group.skills.length === 0 ? (
                                                                    <div className="mt-5 rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-400">
                                                                        이 카테고리에 아직 추가된 스킬이 없습니다
                                                                    </div>
                                                                ) : (
                                                                    <div className="mt-5 flex flex-wrap gap-3">
                                                                        {group.skills.map((skill) => (
                                                                            <div
                                                                                key={skill}
                                                                                className="flex items-center gap-3 rounded-2xl border border-blue-400 bg-blue-50 px-4 py-2 text-sm text-blue-600"
                                                                            >
                                                                                <span>{skill}</span>
                                                                                <button
                                                                                    type="button"
                                                                                    className="text-blue-500 hover:text-blue-700"
                                                                                    onClick={() => removeSkillFromGroup(index, skill)}
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={addSkillGroup}
                                                    className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-base font-semibold text-white shadow-sm hover:opacity-95"
                                                >
                                                    + 스킬 그룹 추가하기
                                                </button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "자격증" && (
                                <Card className="rounded-2xl border border-slate-200 shadow-none">
                                    <CardContent className="p-6">
                                        <div className="mb-5">
                                            <div className="flex items-center gap-2">
                                                <Award className="h-4 w-4 text-blue-500" />
                                                <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                                                    자격증
                                                </h3>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                보유하신 자격증 정보를 입력해주세요. 드래그하여 순서를 변경할 수 있습니다.
                                            </p>
                                        </div>

                                        {/* 초기 빈 화면 */}
                                        {formData.certificates.length === 0 && (
                                            <div className="rounded-xl border border-slate-200 bg-white p-6">
                                                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                                                    <Award className="mb-4 h-12 w-12 text-slate-300" />
                                                    <p className="text-xl font-semibold text-slate-700">
                                                        아직 등록된 자격증이 없습니다
                                                    </p>
                                                    <p className="mt-2 text-sm text-slate-400">
                                                        '자격증 추가' 버튼을 클릭하여 첫 번째 자격증을 등록해보세요
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={addCertificate}
                                                    className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-blue-400 bg-white text-base font-semibold text-blue-600 hover:bg-blue-50"
                                                >
                                                    + 자격증 추가
                                                </button>
                                            </div>
                                        )}

                                        {/* 입력 카드들 */}
                                        {formData.certificates.length > 0 && (
                                            <div className="space-y-5">
                                                {formData.certificates.map((cert, index) => (
                                                    <div
                                                        key={index}
                                                        className="overflow-visible rounded-xl border border-slate-200 bg-white"
                                                    >
                                                        {/* 상단 헤더 */}
                                                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-slate-400">⋮⋮</div>
                                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                    <Award className="h-4 w-4 text-blue-500" />
                                                                    자격증 {index + 1}
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeCertificate(index)}
                                                                className="text-sm text-slate-400 hover:text-red-500"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>

                                                        {/* 본문 */}
                                                        <div className="space-y-5 p-5">
                                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        자격증명 *
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        placeholder="예: 정보처리기사"
                                                                        value={cert.name}
                                                                        onChange={(e) =>
                                                                            updateCertificateField(index, "name", e.target.value)
                                                                        }
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        발급기관
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        placeholder="예: 한국산업인력공단"
                                                                        value={cert.issuer}
                                                                        onChange={(e) =>
                                                                            updateCertificateField(index, "issuer", e.target.value)
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        등급/점수 (선택)
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        placeholder="예: 1급, 900점, Associate"
                                                                        value={cert.grade}
                                                                        onChange={(e) =>
                                                                            updateCertificateField(index, "grade", e.target.value)
                                                                        }
                                                                    />
                                                                </div>

                                                                <div />
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        취득일 *
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        type="date"
                                                                        value={cert.acquiredDate}
                                                                        onChange={(e) =>
                                                                            updateCertificateField(
                                                                                index,
                                                                                "acquiredDate",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        만료일 (선택)
                                                                    </label>
                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        type="date"
                                                                        value={cert.expiryDate}
                                                                        disabled={cert.noExpiry}
                                                                        onChange={(e) =>
                                                                            updateCertificateField(
                                                                                index,
                                                                                "expiryDate",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />

                                                                    <div className="mt-3 flex items-center gap-3">
                                                                        <button
                                                                            type="button"
                                                                            className={`rounded-md border px-3 py-2 text-sm ${cert.noExpiry
                                                                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                                                                : "border-slate-200 bg-white text-slate-500"
                                                                                }`}
                                                                            onClick={() =>
                                                                                updateCertificateField(index, "noExpiry", !cert.noExpiry)
                                                                            }
                                                                        >
                                                                            ∞ 평생유효
                                                                        </button>
                                                                    </div>

                                                                    <p className="mt-2 text-xs text-slate-400">
                                                                        평생유효한 자격증인 경우 만료일을 입력하지 않아도 됩니다
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={addCertificate}
                                                    className="flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-blue-400 bg-white text-base font-semibold text-blue-600 hover:bg-blue-50"
                                                >
                                                    + 자격증 추가
                                                </button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "수상경력" && (
                                <Card className="rounded-2xl border border-slate-200 shadow-none">
                                    <CardContent className="p-6">
                                        <div className="mb-5">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-blue-500" />
                                                <h3 className="text-2xl font-bold text-slate-800">수상경력</h3>
                                            </div>

                                            <p className="mt-2 text-sm text-slate-500">
                                                수상하신 경력을 입력해주세요. 드래그하여 순서를 변경할 수 있습니다.
                                            </p>
                                        </div>

                                        {/* 초기 빈 상태 */}
                                        {formData.awards.length === 0 && (
                                            <div className="rounded-xl border border-slate-200 bg-white p-6">
                                                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                                                    <Trophy className="mb-4 h-12 w-12 text-slate-300" />

                                                    <p className="text-xl font-semibold text-slate-700">
                                                        아직 등록된 수상경력이 없습니다
                                                    </p>

                                                    <p className="mt-2 text-sm text-slate-400">
                                                        '수상경력 추가' 버튼을 클릭하여 첫 번째 수상경력을 등록해보세요
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={addAward}
                                                    className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-blue-400 bg-white text-base font-semibold text-blue-600 hover:bg-blue-50"
                                                >
                                                    + 수상경력 추가
                                                </button>
                                            </div>
                                        )}

                                        {/* 입력 카드 */}
                                        {formData.awards.length > 0 && (
                                            <div className="space-y-5">
                                                {formData.awards.map((award, index) => (
                                                    <div
                                                        key={index}
                                                        className="overflow-visible rounded-xl border border-slate-200 bg-white"
                                                    >
                                                        {/* 카드 헤더 */}
                                                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-slate-400">⋮⋮</div>

                                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                    <Trophy className="h-4 w-4 text-blue-500" />
                                                                    수상경력 {index + 1}
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeAward(index)}
                                                                className="text-sm text-slate-400 hover:text-red-500"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>

                                                        {/* 카드 본문 */}
                                                        <div className="space-y-5 p-5">
                                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        수상명
                                                                    </label>

                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        placeholder="예: 대상, 우수논문상, 대통령상"
                                                                        value={award.title}
                                                                        onChange={(e) =>
                                                                            updateAwardField(index, "title", e.target.value)
                                                                        }
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                        수여기관
                                                                    </label>

                                                                    <Input
                                                                        className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                        placeholder="예: 교육부, 삼성전자, 서울대학교"
                                                                        value={award.organization}
                                                                        onChange={(e) =>
                                                                            updateAwardField(
                                                                                index,
                                                                                "organization",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                    설명/비고 (선택)
                                                                </label>

                                                                <Input
                                                                    className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                    placeholder="예: 전국 1등, 최우수상, 금상"
                                                                    value={award.description}
                                                                    onChange={(e) =>
                                                                        updateAwardField(
                                                                            index,
                                                                            "description",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="max-w-xs">
                                                                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                    수상일
                                                                </label>

                                                                <Input
                                                                    type="date"
                                                                    className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                    value={award.date}
                                                                    onChange={(e) =>
                                                                        updateAwardField(index, "date", e.target.value)
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={addAward}
                                                    className="flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-blue-400 bg-white text-base font-semibold text-blue-600 hover:bg-blue-50"
                                                >
                                                    + 수상경력 추가
                                                </button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="fixed bottom-6 right-6 z-[9999] max-w-[calc(100vw-320px)]">
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-xl">
                        <div className="grid grid-cols-[180px_minmax(0,1fr)] items-center gap-4">
                            <div>
                                <div className="text-sm font-semibold text-blue-600">
                                    {currentStep + 1} / {totalSteps}
                                </div>
                                <div className="mt-1 flex gap-1">
                                    {tabs.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-2 w-2 rounded-full ${index <= currentStep ? "bg-blue-500" : "bg-slate-300"}`}
                                        />
                                    ))}
                                </div>
                                <div className="mt-2 text-lg font-bold text-slate-800">
                                    {activeTab} 입력
                                </div>
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center justify-end gap-3">
                                    {!isFirstStep && (
                                        <Button type="button" variant="outline" className="h-12 shrink-0 px-5" onClick={goPrevStep}>
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            이전
                                        </Button>
                                    )}

                                    <Button type="button" variant="outline" className="h-12 shrink-0 px-5" onClick={handleTempSave}>
                                        <Save className="mr-1 h-4 w-4" />
                                        임시저장
                                    </Button>

                                    {isLastStep ? (
                                        <Button type="button" className="h-12 shrink-0 bg-emerald-500 px-6 text-white hover:bg-emerald-600" onClick={handlePreview}>
                                            <Rocket className="mr-1 h-4 w-4" />
                                            미리보기 및 완성
                                        </Button>
                                    ) : (
                                        <Button type="button" className="h-12 shrink-0 bg-blue-600 px-6 text-white hover:bg-blue-700" onClick={goNextStep}>
                                            다음 단계
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {previewModalOpen && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
                        <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">🚀</div>
                                <div className="text-lg font-bold">미리보기 및 완성하기</div>
                            </div>

                            <div className="mb-6 text-sm text-gray-500">
                                🎉 이력서가 완성되었습니다!<br />
                                미리보기에서 최종 이력서를 확인하시겠습니까?
                            </div>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setPreviewModalOpen(false)} className="rounded-lg bg-gray-100 px-5 py-2 text-gray-600">
                                    취소
                                </button>
                                <button type="button" onClick={confirmPreview} className="rounded-lg bg-emerald-500 px-6 py-2 text-white">
                                    미리보기 및 완성하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {skillModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                        <div className="h-[80vh] w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b px-5 py-4">
                                <h4 className="text-xl font-bold text-slate-800">
                                    스킬 카테고리 선택
                                </h4>
                                <button
                                    type="button"
                                    className="text-xl text-slate-500 hover:text-slate-700"
                                    onClick={() => setSkillModalOpen(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="h-[calc(80vh-73px)] overflow-y-auto px-5 py-4">
                                <div className="relative mb-5">
                                    <Input
                                        className="h-11 border-slate-200 pr-10"
                                        placeholder="카테고리 검색..."
                                        value={skillModalSearch}
                                        onChange={(e) => setSkillModalSearch(e.target.value)}
                                    />
                                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>

                                <div className="space-y-5">
                                    {filteredSkillCategories.map((section) => {
                                        const SectionIcon = section.icon
                                        return (
                                            <div key={section.group}>
                                                <div className="mb-3 rounded-md bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 border-l-4 border-blue-500">
                                                    {section.group}
                                                </div>

                                                <div className="space-y-2">
                                                    {section.items.map((item) => (
                                                        <button
                                                            key={item}
                                                            type="button"
                                                            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                                                            onClick={() => {
                                                                if (selectedSkillGroupIndex !== null) {
                                                                    updateSkillGroupField(
                                                                        selectedSkillGroupIndex,
                                                                        "category",
                                                                        item
                                                                    )
                                                                }
                                                                setSkillModalOpen(false)
                                                            }}
                                                        >
                                                            <SectionIcon className="h-4 w-4 text-cyan-500" />
                                                            <span>{item}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {skillSearchModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
                        <div className="w-[500px] max-w-[92vw] overflow-hidden rounded-2xl bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b px-5 py-4">
                                <h4 className="text-[28px] font-bold text-slate-800">스킬 검색</h4>
                                <button
                                    type="button"
                                    className="text-slate-500 hover:text-slate-700"
                                    onClick={() => setSkillSearchModalOpen(false)}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="border-b px-5 py-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                                    <Input
                                        className="h-12 border-blue-400 pl-10 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                        placeholder="스킬명 입력..."
                                        value={skillSearchKeyword}
                                        onChange={(e) => setSkillSearchKeyword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex min-h-[240px] flex-col items-center justify-center px-5 py-10 text-center">
                                <Info className="mb-4 h-14 w-14 text-slate-300" />

                                {skillSearchKeyword.trim() === "" ? (
                                    <p className="text-lg font-semibold text-slate-700">
                                        스킬을 검색해주세요
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-lg font-semibold text-slate-700">
                                            검색 결과가 없습니다
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleDirectAddSkill}
                                            className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                                        >
                                            "{skillSearchKeyword}" 직접 추가
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                </>
            )}
            </div>
        )
    }
