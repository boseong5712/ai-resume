"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
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
    Sparkles,
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
    "숭실대학교",
]

const MAJOR_OPTIONS = [
    "컴퓨터공학과",
    "소프트웨어공학과",
    "인공지능학과",
    "전자공학과",
    "경영학과",
    "경제학과",
]

const DEGREE_OPTIONS = ["고등학교졸업", "전문학사", "학사", "석사", "박사"]
const STATUS_OPTIONS = ["졸업", "졸업예정", "재학중", "수료", "중퇴"]
const COMPANY_OPTIONS = ["삼성전자", "LG전자", "네이버", "카카오", "쿠팡", "배달의민족", "토스", "라인", "SK하이닉스", "현대자동차", "CJ올리브영", "당근", "오늘의집", "직방", "우아한형제들"]
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

type ValidationResult = {
    ok: boolean
    message?: string
    tab?: string
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
    { group: "개발", icon: Code2, items: ["프론트엔드", "백엔드", "풀스택"] },
    { group: "모바일", icon: Smartphone, items: ["iOS", "Android", "크로스플랫폼"] },
    { group: "데이터", icon: Database, items: ["데이터베이스", "데이터 분석", "머신러닝/AI"] },
    { group: "인프라", icon: Cloud, items: ["클라우드", "DevOps/CI/CD", "서버/네트워크"] },
    { group: "디자인", icon: Palette, items: ["UI/UX", "그래픽 디자인", "브랜드 디자인"] },
    { group: "테스트", icon: Bug, items: ["QA", "테스트 자동화", "성능 최적화"] },
    { group: "협업", icon: FolderKanban, items: ["프로젝트 관리", "문서화", "버전 관리"] },
    { group: "마케팅", icon: Megaphone, items: ["디지털 마케팅", "콘텐츠 마케팅", "CRM"] },
    { group: "영업", icon: Handshake, items: ["B2B 영업", "B2C 영업", "고객 관리"] },
    { group: "인사", icon: Users, items: ["채용", "인사 관리", "교육/연수"] },
    { group: "재무", icon: Calculator, items: ["회계", "세무", "재무 분석"] },
    { group: "법무", icon: Scale, items: ["계약/법무", "컴플라이언스", "전략 기획"] },
    { group: "제조", icon: Factory, items: ["생산 관리", "품질 관리", "공정 개선"] },
    { group: "물류", icon: Truck, items: ["물류 관리", "재고 관리", "SCM"] },
]

const SKILL_SEARCH_ITEMS = [
    { category: "프론트엔드", skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Nuxt.js", "Svelte", "Tailwind CSS", "Redux", "Zustand", "React Query", "Webpack", "Vite"] },
    { category: "백엔드", skills: ["Node.js", "Express", "NestJS", "Java", "Spring", "Spring Boot", "Kotlin", "Python", "Django", "FastAPI", "Flask", "PHP", "Laravel", "Go", "GraphQL", "REST API"] },
    { category: "데이터베이스", skills: ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "MariaDB", "SQLite", "DynamoDB", "Elasticsearch", "Firebase", "Supabase"] },
    { category: "데이터/AI", skills: ["Python", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn", "R", "SQL", "Tableau", "Power BI", "머신러닝", "딥러닝", "데이터 분석"] },
    { category: "인프라/클라우드", skills: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Nginx", "Linux", "GitHub Actions", "Jenkins", "Terraform", "CI/CD", "Vercel", "Netlify"] },
    { category: "모바일", skills: ["React Native", "Flutter", "Swift", "Kotlin", "Android", "iOS", "Dart", "Expo"] },
    { category: "디자인", skills: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX", "디자인 시스템", "프로토타이핑"] },
    { category: "협업/도구", skills: ["Git", "GitHub", "GitLab", "Jira", "Notion", "Slack", "Confluence", "Figma", "Agile", "Scrum"] },
]

const ALL_SKILL_ITEMS = Array.from(new Set(SKILL_SEARCH_ITEMS.flatMap((group) => group.skills))).sort((a, b) =>
    a.localeCompare(b)
)
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
        address: "",
        birthDate: "",
        school: "",
        company: "",
        photoUrl: "",
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

    useEffect(() => {
        const handleUnload = () => {
            localStorage.removeItem("resumeData")
            localStorage.removeItem("savedResume")
        }

        window.addEventListener("beforeunload", handleUnload)

        return () => {
            window.removeEventListener("beforeunload", handleUnload)
        }
    }, [])

    const progress = useMemo(() => {
        if (!isMounted) return 0

        let score = 0

        // 기본정보 최대 50
        if (formData.resumeTitle?.trim()) score += 10
        if (formData.name?.trim()) score += 15
        if (formData.email?.trim()) score += 15
        if (formData.phone?.trim()) score += 10

        // 학력 최대 40
        formData.education.forEach((edu) => {
            if (edu.schoolName?.trim()) score += 10
            if (edu.major?.trim()) score += 10
            if (edu.degree?.trim()) score += 5
            if (edu.status?.trim()) score += 5
            if (edu.admissionDate?.trim()) score += 5
            if (edu.graduationDate?.trim()) score += 5
        })

        // 경력 최대 40
        formData.career.forEach((career) => {
            if (career.companyName?.trim()) score += 10
            if (career.position?.trim()) score += 10
            if (career.startDate?.trim()) score += 5
            if (career.endDate?.trim() || career.isCurrent) score += 5
            if (career.description?.trim()) score += 10
        })

        // 보유기술 최대 40
        formData.skillGroups.forEach((group) => {
            if (group.category?.trim()) score += 15
            if (group.skills.length > 0) score += 25
        })

        // 자격증 최대 15
        formData.certificates.forEach((cert) => {
            if (cert.name?.trim()) score += 5
            if (cert.issuer?.trim()) score += 5
            if (cert.acquiredDate?.trim()) score += 5
        })

        // 수상경력 최대 15
        formData.awards.forEach((award) => {
            if (award.title?.trim()) score += 5
            if (award.organization?.trim()) score += 5
            if (award.date?.trim()) score += 5
        })

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

    const normalizeFormData = useCallback((
        data?: Partial<typeof defaultFormData> | null
    ): typeof defaultFormData => ({
        resumeTitle: data?.resumeTitle ?? "",
        name: data?.name ?? "",
        email: data?.email ?? "",
        phone: data?.phone ?? "",
        address: data?.address ?? "",
        birthDate: data?.birthDate ?? "",
        school: data?.school ?? "",
        company: data?.company ?? "",
        photoUrl: data?.photoUrl ?? "",
        skills: data?.skills ?? [],
        education: (data?.education ?? []).map((edu) => ({
            schoolName: "",
            major: "",
            degree: "학사",
            status: "졸업",
            gpa: "",
            gpaScale: "4.3",
            admissionDate: "",
            graduationDate: "",
            extraInfo: "",
            ...edu,
        })),
        career: (data?.career ?? []).map((career) => ({
            companyName: "",
            position: "",
            startDate: "",
            endDate: "",
            isCurrent: false,
            description: "",
            ...career,
        })),
        skillGroups: (data?.skillGroups ?? []).map((group) => ({
            category: "",
            skills: [],
            ...group,
            skills: group.skills ?? [],
        })),
        certificates: (data?.certificates ?? []).map((cert) => ({
            name: "",
            issuer: "",
            grade: "",
            acquiredDate: "",
            expiryDate: "",
            noExpiry: false,
            ...cert,
        })),
        awards: (data?.awards ?? []).map((award) => ({
            title: "",
            organization: "",
            description: "",
            date: "",
            ...award,
        })),
    }), [])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const editingResumeId = localStorage.getItem("editingResumeId")
            const savedResumes = JSON.parse(localStorage.getItem("savedResumes") || "[]") as Array<{
                id: string
                data: typeof defaultFormData
            }>

            if (editingResumeId) {
                const targetResume = savedResumes.find(
                    (resume) => resume.id === editingResumeId
                )

                if (targetResume) {
                    setFormData(normalizeFormData(targetResume.data))
                    localStorage.setItem("resumeBuilderMode", "edit")
                    localStorage.removeItem("previewResumeId")
                    setIsMounted(true)
                    return
                }
            }

            localStorage.removeItem("editingResumeId")
            localStorage.removeItem("resumeBuilderMode")
            localStorage.removeItem("resumeData")
            localStorage.removeItem("savedResume")

            setIsMounted(true)
        }, 0)

        return () => window.clearTimeout(timer)
    }, [normalizeFormData])

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

    const selectedSkillSearchGroup =
        selectedSkillSearchGroupIndex === null ? null : formData.skillGroups[selectedSkillSearchGroupIndex]
    const selectedSkillSearchCategory = selectedSkillSearchGroup?.category || ""
    const currentCategorySkills =
        SKILL_SEARCH_ITEMS.find((group) => group.category === selectedSkillSearchCategory)?.skills || []
    const skillSearchPool = currentCategorySkills.length > 0 ? currentCategorySkills : ALL_SKILL_ITEMS
    const filteredSkillSearchResults = skillSearchPool
        .filter((skill) => skill.toLowerCase().includes(skillSearchKeyword.trim().toLowerCase()))
        .slice(0, 80)

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

    const validateRequiredFields = (): ValidationResult => {
        if (!formData.name.trim()) return { ok: false, tab: tabs[0], message: "기본정보의 이름을 입력해주세요." }
        if (!formData.email.trim()) return { ok: false, tab: tabs[0], message: "기본정보의 이메일을 입력해주세요." }
        if (!formData.phone.trim()) return { ok: false, tab: tabs[0], message: "기본정보의 전화번호를 입력해주세요." }
        if (!formData.birthDate.trim()) return { ok: false, tab: tabs[0], message: "기본정보의 생년월일을 입력해주세요." }

        for (let index = 0; index < formData.education.length; index += 1) {
            const edu = formData.education[index]
            if (!edu.schoolName.trim()) return { ok: false, tab: tabs[1], message: `학력사항 ${index + 1}의 학교명을 입력해주세요.` }
            if (!edu.major.trim()) return { ok: false, tab: tabs[1], message: `학력사항 ${index + 1}의 전공을 입력해주세요.` }
            if (!edu.admissionDate.trim()) return { ok: false, tab: tabs[1], message: `학력사항 ${index + 1}의 입학일을 입력해주세요.` }
        }

        for (let index = 0; index < formData.career.length; index += 1) {
            const career = formData.career[index]
            if (!career.companyName.trim()) return { ok: false, tab: tabs[2], message: `경력사항 ${index + 1}의 회사명을 입력해주세요.` }
            if (!career.position.trim()) return { ok: false, tab: tabs[2], message: `경력사항 ${index + 1}의 직책을 입력해주세요.` }
            if (!career.startDate.trim()) return { ok: false, tab: tabs[2], message: `경력사항 ${index + 1}의 시작일을 입력해주세요.` }
        }

        for (let index = 0; index < formData.skillGroups.length; index += 1) {
            const group = formData.skillGroups[index]
            if (!group.category.trim()) return { ok: false, tab: tabs[3], message: `보유기술 ${index + 1}의 카테고리를 선택해주세요.` }
            if (group.skills.length === 0) return { ok: false, tab: tabs[3], message: `보유기술 ${index + 1}의 스킬 목록을 1개 이상 추가해주세요.` }
        }

        for (let index = 0; index < formData.certificates.length; index += 1) {
            const cert = formData.certificates[index]
            if (!cert.name.trim()) return { ok: false, tab: tabs[4], message: `자격증 ${index + 1}의 자격증명을 입력해주세요.` }
            if (!cert.acquiredDate.trim()) return { ok: false, tab: tabs[4], message: `자격증 ${index + 1}의 취득일을 입력해주세요.` }
        }

        return { ok: true }
    }

    const alertRequiredFields = () => {
        const result = validateRequiredFields()
        if (result.ok) return true

        if (result.tab) setActiveTab(result.tab)
        window.alert(result.message || "필수 입력 항목을 작성해주세요.")
        return false
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
        if (!alertRequiredFields()) return
        if (!isLastStep) setActiveTab(tabs[currentStep + 1])
    }

    const handleTempSave = () => {
        localStorage.removeItem("resumeData")
        alert("임시저장되었습니다.")
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()

        reader.onload = () => {
            setFormData((prev) => ({
                ...prev,
                photoUrl: reader.result as string,
            }))
        }

        reader.readAsDataURL(file)
    }

    const handlePreview = () => {
        setPreviewModalOpen(true)
    }

    const confirmPreview = () => {
        if (!alertRequiredFields()) return

        localStorage.setItem("resumeData", JSON.stringify(formData))
        localStorage.removeItem("previewResumeId")
        setPreviewModalOpen(false)
        router.push("/tools/resume-builder/preview")
    }

    const handleSaveResume = () => {
        if (!alertRequiredFields()) return

        const ok = window.confirm(
            "이력서를 저장하시겠습니까?\n저장 후에도 언제든지 수정할 수 있습니다."
        )

        if (!ok) return

        const savedResumes = JSON.parse(
            localStorage.getItem("savedResumes") || "[]"
        )

        const editingResumeId = localStorage.getItem("editingResumeId")

        const now = new Date().toISOString()

        if (editingResumeId) {
            const updatedResumes = savedResumes.map((resume: { id: string }) =>
                resume.id === editingResumeId
                    ? {
                        ...resume,
                        title: formData.resumeTitle || formData.name || "제목 없는 이력서",
                        data: formData,
                        updatedAt: now,
                    }
                    : resume
            )

            localStorage.setItem("savedResumes", JSON.stringify(updatedResumes))
            localStorage.removeItem("editingResumeId")
        } else {
            const newResume = {
                id: crypto.randomUUID(),
                title: formData.resumeTitle || formData.name || "제목 없는 이력서",
                data: formData,
                createdAt: now,
                updatedAt: now,
                isMain: false,
            }

            localStorage.setItem(
                "savedResumes",
                JSON.stringify([newResume, ...savedResumes])
            )
        }

        localStorage.removeItem("resumeData")
        window.location.href = "/tools/mypage/save-builder-resume"
    }

    const resetResumeForm = () => {
        localStorage.removeItem("resumeData")
        localStorage.removeItem("savedResume")

        setFormData(defaultFormData)

        setActiveTab("기본정보")
        setPreviewModalOpen(false)
    }

    const router = useRouter()

    return (
        <div className="relative min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto w-full max-w-[900px] space-y-5 rounded-[20px] bg-white p-7 pb-48 shadow-[0_4px_22px_rgba(38,60,112,0.08)]">
                <Card className="relative overflow-hidden rounded-[20px] border border-[#edf1fa] bg-white shadow-sm">
                    <CardContent className="px-8 py-8">
                        <span className="absolute left-3 top-8 h-1 w-1 rounded-full bg-blue-300" />
                        <span className="absolute bottom-4 left-2 h-8 w-8 rounded-full bg-violet-100/70 blur-lg" />
                        <span className="absolute right-3 top-2 h-9 w-9 rounded-full bg-blue-100 blur-lg" />
                        <div className="relative flex items-start justify-between gap-6">
                            <div className="text-center sm:text-left">
                                <h2 className="flex items-center justify-center gap-2 text-[30px] font-extrabold text-[#1760d6] sm:justify-start">
                                    <Sparkles className="h-7 w-7 fill-blue-500 text-blue-500" />
                                    이력서 생성기
                                </h2>
                                <p className="mt-3 text-sm text-slate-500">
                                    단계별로 차근차근 완성해보세요
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex h-[74px] w-[118px] flex-col items-center justify-center rounded-xl border border-[#d7e5ff] bg-[#f7faff]">
                                    <div className="text-3xl font-bold text-[#347cff]">
                                        {progress}%
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">완성률</div>
                                </div>

                                <div className="flex h-[74px] w-[118px] flex-col items-center justify-center rounded-xl border border-[#d7e5ff] bg-[#f7faff]">
                                    <div className="text-lg font-bold text-slate-900">
                                        {progress >= 100 ? "완성" : "작성중"}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">진행상태</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative mt-4 inline-flex items-center rounded-full border border-[#d7e5ff] bg-[#f7faff] px-3 py-1 text-sm font-medium text-[#347cff]">
                            이력서 제목&nbsp;
                            <span className="font-bold">
                                {formData.resumeTitle || "미입력"}
                            </span>
                        </div>
                        <div className="relative mt-8 h-2 w-full rounded-full bg-[#edf4ff]">
                            <div
                                className="h-2 rounded-full bg-[#347cff] transition-all"
                                style={{ width: `${Math.min(progress / 2, 100)}%` }}
                            />
                        </div>

                        <div className="relative mt-5 flex h-14 items-center justify-between rounded-xl border border-[#d7e5ff] bg-white px-5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
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
                                    ✓
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
                
                <Card className="rounded-[18px] border border-[#edf1fa] bg-white shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab

                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${isActive
                                                ? "bg-[#347cff] text-white font-bold shadow-sm"
                                                : "bg-[#f7faff] text-slate-500 hover:bg-blue-50"
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

                <Card className="min-h-[500px] rounded-[18px] border border-[#edf1fa] bg-[#fbfcff] shadow-sm">
                    <CardContent className="p-6">
                        {activeTab === "기본정보" && (
                            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-32 h-40 overflow-hidden rounded-md border bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                        {formData.photoUrl ? (
                                            <img
                                                src={formData.photoUrl}
                                                alt="프로필 사진"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            "사진 추가"
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
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
                                            value={formData.name ?? ""}
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
                                            value={formData.email ?? ""}
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
                                            value={formData.phone ?? ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">주소</label>
                                        <Input
                                            className="mt-2"
                                            placeholder="주소를 입력하세요"
                                            value={formData.address ?? ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, address: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">생년월일 *</label>
                                        <Input
                                            className="mt-2"
                                            type="date"
                                            value={formData.birthDate ?? ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, birthDate: e.target.value })
                                            }
                                        />
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
                                            학력사항은 최신순 또는 시간순으로 입력해주세요.
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
                                                             <div className="text-slate-400">📘</div>
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
                                            경력사항은 최신 경력부터 입력해주세요.
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
                                                            <div className="text-slate-400">💼</div>
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
                                                                <span className="text-blue-500">✦</span>
                                                                담당업무 및 성과
                                                            </div>

                                                            <textarea
                                                                className="min-h-[110px] w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:ring-1 focus:ring-sky-500"
                                                                placeholder={`주요 담당업무와 성과를 구체적으로 작성해주세요
예: 사용자 경험 개선으로 전환율 15% 향상
예: React 기반 웹 애플리케이션 개발 및 유지보수`}
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
                                                보유기술
                                            </h3>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-500">
                                            보유하고 있는 기술을 카테고리별로 정리해주세요.
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
                                                            <div className="text-slate-400">🛠</div>
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
                                            보유하신 자격증 정보를 입력해주세요.
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
                                                    자격증 추가 버튼을 클릭해 첫 번째 자격증을 등록해보세요
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

                                    {/* 입력 카드 */}
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
                                                            <div className="text-slate-400">🏅</div>
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
                                                                        평생유효
                                                                    </button>
                                                                </div>

                                                                <p className="mt-2 text-xs text-slate-400">
                                                                    평생유효인 자격증은 만료일을 입력하지 않아도 됩니다.
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
                                            수상하신 경력을 입력해주세요.
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
                                                    수상경력 추가 버튼을 클릭해 첫 번째 수상경력을 등록해보세요
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
                                                            <div className="text-slate-400">🏆</div>

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
                                                                    수상명 *
                                                                </label>

                                                                <Input
                                                                    className="h-11 border-slate-200 bg-white text-sm shadow-none focus-visible:ring-1 focus-visible:ring-sky-500"
                                                                    placeholder="예: 데이터 분석 공모전 대상"
                                                                    value={award.title}
                                                                    onChange={(e) =>
                                                                        updateAwardField(index, "title", e.target.value)
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-[13px] font-semibold text-slate-700">
                                                                    수여기관 *
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
                                                                placeholder="예: 전국 1위, 최우수상, 금상"
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
                                                                수상일 *
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

            <div className="fixed bottom-6 right-8 z-[9999] w-[min(420px,calc(100vw-48px))]">
                <div className="rounded-2xl border border-[#d7e5ff] bg-white px-4 py-4 shadow-[0_8px_28px_rgba(38,60,112,0.16)]">
                    <div className="grid grid-cols-[128px_minmax(0,1fr)] items-center gap-3">
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
                            <div className="flex flex-nowrap items-center justify-end gap-2">
                                {!isFirstStep && (
                                    <Button type="button" variant="outline" className="h-11 shrink-0 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm text-slate-500" onClick={goPrevStep}>
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        이전
                                    </Button>
                                )}

                                <Button type="button" variant="outline" aria-label="임시저장" className="h-11 w-11 shrink-0 rounded-xl border-slate-200 bg-slate-50 p-0" onClick={handleTempSave}>
                                    <Save className="h-4 w-4 text-slate-500" />
                                </Button>

                                {isLastStep ? (
                                    <Button type="button" className="h-11 shrink-0 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white hover:bg-emerald-600" onClick={handlePreview}>
                                        <Rocket className="mr-1 h-4 w-4" />
                                        완성
                                    </Button>
                                ) : (
                                    <Button type="button" className="h-11 shrink-0 rounded-xl bg-[#397df0] px-5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700" onClick={goNextStep}>
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">✓</div>
                            <div className="text-lg font-bold">미리보기 및 완성하기</div>
                        </div>

                        <div className="mb-6 text-sm text-gray-500">
                            이력서가 완성되었습니다.<br />
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
                    <div className="max-h-[82vh] w-[500px] max-w-[92vw] overflow-hidden rounded-2xl bg-white shadow-2xl">
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
                                    placeholder="스킬명을 입력하세요"
                                    value={skillSearchKeyword}
                                    onChange={(e) => setSkillSearchKeyword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="max-h-[420px] min-h-[240px] overflow-y-auto px-5 py-5 pr-3">
                            {skillSearchKeyword.trim() === "" ? (
                                <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
                                    <Info className="mb-4 h-14 w-14 text-slate-300" />
                                    <p className="text-lg font-semibold text-slate-700">스킬을 검색해주세요</p>
                                    {selectedSkillSearchCategory && (
                                        <p className="mt-2 text-sm text-slate-400">현재 카테고리: {selectedSkillSearchCategory}</p>
                                    )}
                                </div>
                            ) : filteredSkillSearchResults.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="mb-3 text-sm font-semibold text-slate-500">
                                        검색 결과 {filteredSkillSearchResults.length}개
                                    </p>
                                    {filteredSkillSearchResults.map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => {
                                                if (selectedSkillSearchGroupIndex === null) return
                                                addSkillToGroup(selectedSkillSearchGroupIndex, skill)
                                                setSkillSearchKeyword("")
                                                setSkillSearchModalOpen(false)
                                            }}
                                            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                                        >
                                            <span>{skill}</span>
                                            <span className="text-blue-600">추가</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
                                    <Info className="mb-4 h-14 w-14 text-slate-300" />
                                    <p className="text-lg font-semibold text-slate-700">검색 결과가 없습니다</p>
                                    <button
                                        type="button"
                                        onClick={handleDirectAddSkill}
                                        className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        {skillSearchKeyword} 직접 추가
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}



