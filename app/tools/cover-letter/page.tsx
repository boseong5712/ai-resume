"use client"

import { useMemo, useState } from "react"
import {
    Briefcase,
    Building2,
    CheckSquare,
    ChevronDown,
    ChevronRight,
    FileText,
    HelpCircle,
    Info,
    Lightbulb,
    Link2,
    Pencil,
    Play,
    Save,
    Sparkles,
    Tag,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { JOB_DATA } from "@/app/data/jobData"

type Career = {
    company: string
    position: string
    period: string
    description: string
}

export default function CoverLetterPage() {
    const [title, setTitle] = useState("")
    const [company, setCompany] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedJob, setSelectedJob] = useState("")
    const [selectedTasks, setSelectedTasks] = useState<string[]>([])
    const [situationOpen, setSituationOpen] = useState(true)
    const [situation, setSituation] = useState("")
    const [careerType, setCareerType] = useState<"신입" | "경력">("신입")
    const [careers, setCareers] = useState<Career[]>([])
    const [experienceInput, setExperienceInput] = useState("")
    const [experiences, setExperiences] = useState<string[]>([])
    const [keywordInput, setKeywordInput] = useState("")
    const [keywords, setKeywords] = useState<string[]>([])

    const selectedCategoryData = useMemo(() => {
        return JOB_DATA.find((item) => item.category === selectedCategory)
    }, [selectedCategory])

    const selectedJobData = useMemo(() => {
        return selectedCategoryData?.jobs.find((job) => job.name === selectedJob)
    }, [selectedCategoryData, selectedJob])

    const handleCategoryClick = (category: string) => {
        const nextCategory = JOB_DATA.find((item) => item.category === category)
        if (!nextCategory) return

        setSelectedCategory(category)
        const handleCategoryClick = (category: string) => {
            setSelectedCategory(category)
            setSelectedJob("")
            setSelectedTasks([])
        }
        setSelectedTasks([])
    }

    const handleJobClick = (jobName: string) => {
        setSelectedJob(jobName)
        setSelectedTasks([])
    }

    const toggleTask = (task: string) => {
        setSelectedTasks((prev) =>
            prev.includes(task)
                ? prev.filter((item) => item !== task)
                : [...prev, task]
        )
    }

    const addCareer = () => {
        setCareers((prev) => [
            ...prev,
            { company: "", position: "", period: "", description: "" },
        ])
    }

    const updateCareer = (index: number, field: keyof Career, value: string) => {
        setCareers((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], [field]: value }
            return next
        })
    }

    const removeCareer = (index: number) => {
        setCareers((prev) => prev.filter((_, i) => i !== index))
    }

    const addExperience = () => {
        const value = experienceInput.trim()
        if (!value) return
        setExperiences((prev) => [...prev, value])
        setExperienceInput("")
    }

    const addKeyword = () => {
        const value = keywordInput.trim()
        if (!value) return
        setKeywords((prev) => [...prev, value])
        setKeywordInput("")
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto max-w-[900px] space-y-6 pb-32">
                <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white px-10 py-12 text-center shadow-sm">
                    <div className="absolute left-6 top-16 h-2 w-2 rounded-full bg-blue-300" />
                    <div className="absolute right-10 top-6 h-8 w-8 rounded-full bg-blue-100 blur-xl" />
                    <div className="absolute left-8 bottom-5 h-8 w-8 rounded-full bg-purple-100 blur-xl" />

                    <h1 className="text-[40px] font-extrabold tracking-tight text-blue-700">
                        자소서 생성기
                    </h1>
                    <p className="mt-5 text-lg font-medium text-slate-600">
                        AI가 당신의 경험과 역량을 분석하여 맞춤형 자기소개서를 작성해드립니다
                    </p>
                </section>

                <section className="rounded-[24px] border border-slate-100 bg-white p-7 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                                <CheckSquare size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">진행 상황</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    단계별로 차근차근 진행해보세요
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="mb-1 text-xs text-slate-500">사용법이 궁금하신가요?</p>
                            <Button className="h-10 rounded-full bg-rose-500 px-5 text-white shadow-lg shadow-rose-200 hover:bg-rose-600">
                                <Play className="mr-2 h-4 w-4 fill-white" />
                                유튜브 영상보기
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="text-sm font-bold text-slate-400">step 1 / 2</p>
                        <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                            기본 정보
                        </h3>
                    </div>
                </section>

                <section className="grid grid-cols-2 gap-4">
                    <div className="rounded-[18px] border border-blue-100 bg-slate-50 p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-purple-300" />
                                    <h3 className="text-xl font-extrabold text-slate-900">
                                        이력서로 시작
                                    </h3>
                                </div>
                                <p className="mt-4 leading-7 text-slate-500">
                                    저장된 이력서 정보를
                                    <br />
                                    불러와서 빠르게
                                    <br />
                                    작성하세요
                                </p>
                            </div>

                            <Button className="h-14 rounded-xl bg-blue-700 px-7 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-800">
                                <FileText className="mr-2 h-4 w-4" />
                                이력서 불러오기
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Link2 className="h-5 w-5 text-emerald-600" />
                                    <h3 className="text-xl font-extrabold text-slate-900">
                                        채용공고로 시작
                                    </h3>
                                </div>
                                <p className="mt-4 leading-7 text-slate-500">
                                    URL을 입력하면 AI가
                                    <br />
                                    자동으로 분석해드려요
                                </p>
                            </div>

                            <Button className="h-14 rounded-xl bg-emerald-600 px-7 font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700">
                                <Link2 className="mr-2 h-4 w-4" />
                                URL 분석하기
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Pencil className="h-6 w-6 text-blue-600" />
                        <h3 className="text-xl font-extrabold text-slate-900">제목</h3>
                        <Info className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예시) 언제나 사용자 입장에서 생각하는 디자이너입니다."
                        className="h-14 rounded-xl border-slate-200 px-5 text-base shadow-none"
                    />
                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <h3 className="text-xl font-extrabold text-slate-900">기업명</h3>
                        <Info className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="예시) 삼성전자"
                        className="h-14 rounded-xl border-slate-200 px-5 text-base shadow-none"
                    />
                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-6 w-6 text-blue-600" />
                            <h3 className="text-xl font-extrabold text-slate-900">
                                직무 선택
                            </h3>
                            <Info className="h-4 w-4 text-slate-400" />
                        </div>

                        <Button
                            variant="outline"
                            className="h-12 rounded-xl border-slate-200 px-5 text-slate-600"
                        >
                            🖍️ 원하는 직무가 없나요?
                        </Button>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-inner">
                        <div className="grid max-h-[520px] grid-cols-3 gap-8 overflow-auto pr-2">
                            <div>
                                <h4 className="mb-4 border-b pb-3 text-lg font-extrabold text-slate-800">
                                    직무 카테고리
                                </h4>

                                <div className="space-y-3">
                                    {JOB_DATA.map((item) => {
                                        const isActive = item.category === selectedCategory

                                        return (
                                            <button
                                                key={item.category}
                                                type="button"
                                                onClick={() => handleCategoryClick(item.category)}
                                                className={`flex h-[58px] w-full items-center gap-4 rounded-lg border-l-4 px-5 text-left text-base font-extrabold shadow-sm transition ${isActive
                                                    ? `${item.color} ${item.activeColor} text-white`
                                                    : `${item.color} bg-white text-slate-900 hover:bg-slate-50`
                                                    }`}
                                            >
                                                <span className="text-lg">{item.icon}</span>
                                                <span>{item.category}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-4 border-b pb-3 text-lg font-extrabold text-slate-800">
                                    세부 직무
                                </h4>

                                {!selectedCategoryData ? (
                                    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">
                                        직무 카테고리를 선택해주세요
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedCategoryData.jobs.map((job) => {
                                            const isActive = job.name === selectedJob

                                            return (
                                                <button
                                                    key={job.name}
                                                    type="button"
                                                    onClick={() => handleJobClick(job.name)}
                                                    className={`h-[58px] w-full rounded-lg border px-5 text-left text-base font-extrabold shadow-sm transition ${isActive
                                                            ? "border-sky-700 bg-sky-700 text-white"
                                                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                                                        }`}
                                                >
                                                    {job.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="mb-4 border-b pb-3 text-lg font-extrabold text-slate-800">
                                    주요 업무{" "}
                                    <span className="text-xs font-bold text-slate-400">
                                        (클릭하여 선택)
                                    </span>
                                </h4>

                                {!selectedJobData ? (
                                    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">
                                        세부 직무를 선택해주세요
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedJobData.tasks.map((task) => {
                                            const isActive = selectedTasks.includes(task)

                                            return (
                                                <button
                                                    key={task}
                                                    type="button"
                                                    onClick={() => toggleTask(task)}
                                                    className={`flex h-[52px] w-full items-center justify-between rounded-lg border px-5 text-left text-sm font-bold shadow-sm transition ${isActive
                                                            ? "border-blue-600 bg-blue-600 text-white"
                                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {task}
                                                    {isActive && <span>✓</span>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {selectedCategory && selectedJob && selectedTasks.length > 0 && (
                        <div className="mt-6 rounded-[18px] border border-blue-200 bg-blue-50 p-6">
                            <div className="mb-5 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <Briefcase size={16} />
                                </div>
                                <h4 className="text-lg font-extrabold text-slate-900">
                                    선택된 직무 정보
                                </h4>
                            </div>

                            <div className="space-y-5 text-sm font-bold">
                                <div className="border-b border-blue-100 pb-4">
                                    <span className="mr-4 text-blue-700">• 직군</span>
                                    <span className="rounded-md border border-blue-300 bg-blue-100 px-4 py-2 text-slate-800">
                                        {selectedCategory}
                                    </span>
                                </div>

                                <div className="border-b border-blue-100 pb-4">
                                    <span className="mr-4 text-blue-700">• 직무</span>
                                    <span className="rounded-md border border-blue-300 bg-blue-100 px-4 py-2 text-slate-800">
                                        {selectedJob}
                                    </span>
                                </div>

                                <div>
                                    <span className="mr-2 text-blue-700">• 주요 업무</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                                        {selectedTasks.length}개
                                    </span>

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {selectedTasks.map((task) => (
                                            <span
                                                key={task}
                                                className="flex items-center gap-3 rounded-2xl bg-blue-600 px-5 py-4 text-white shadow-md shadow-blue-100"
                                            >
                                                {task}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTask(task)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setSituationOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between text-left"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500 text-white">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-amber-400" />
                                    <h3 className="text-xl font-extrabold text-slate-900">
                                        나만의 상황을 AI에게 알려주세요
                                    </h3>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400">
                                        선택사항
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                    AI가 당신의 특별한 상황을 고려하여 더욱 개인화된 자소서를 작성합니다
                                </p>
                            </div>
                        </div>
                        <ChevronDown
                            className={`h-5 w-5 text-slate-400 transition ${situationOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {situationOpen && (
                        <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <div className="font-extrabold text-violet-600">
                                        ✨ 선택사항{" "}
                                        <span className="ml-2 text-xs text-slate-400">
                                            (비워두셔도 됩니다)
                                        </span>
                                    </div>
                                    <p className="mt-5 text-sm font-medium text-slate-600">
                                        작성한 내용을 AI가 핵심 위주로 정리해줍니다.
                                    </p>
                                </div>

                                <Button className="rounded-lg bg-violet-500 text-white hover:bg-violet-600">
                                    ✨ AI 정리하기
                                </Button>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={situation}
                                    onChange={(e) => setSituation(e.target.value.slice(0, 1000))}
                                    placeholder={`예시를 참고하여 자유롭게 작성해주세요:

• 타 업계에서 전향하려고 합니다
• 육아로 인한 경력 공백이 3년 있습니다
• 비전공자이지만 관련 분야 공부를 꾸준히 하고 있습니다`}
                                    className="min-h-[110px] w-full resize-none rounded-xl border border-violet-200 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                                />
                                <span className="absolute bottom-3 right-4 text-xs text-slate-400">
                                    {situation.length}/1000
                                </span>
                            </div>

                            <div className="mt-4 rounded-lg border border-violet-100 bg-white p-4 text-xs text-slate-500">
                                💡 <b>이런 내용을 적어보세요:</b>
                                <br />
                                특별한 경험, 전향 이유, 공백 경력 사유, 지역적 제약, 개인적 동기,
                                직무 관련 기술이나 경험 등 AI 모델이 더 나은 자소서를 작성하는 데
                                도움이 될 다양한 정보
                            </div>
                        </div>
                    )}
                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                            <Briefcase size={16} />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900">경력 사항</h3>
                    </div>

                    <p className="mb-6 text-sm text-slate-500">
                        경력 여부를 선택해주세요. 신입의 경우 학업 및 프로젝트 경험을 중심으로 작성됩니다.
                    </p>

                    <div className="mb-6 grid max-w-[330px] grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <button
                            type="button"
                            onClick={() => setCareerType("신입")}
                            className={`h-12 rounded-lg font-bold transition ${careerType === "신입"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                    : "text-slate-600"
                                }`}
                        >
                            🎓 신입
                        </button>

                        <button
                            type="button"
                            onClick={() => setCareerType("경력")}
                            className={`h-12 rounded-lg font-bold transition ${careerType === "경력"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                    : "text-slate-600"
                                }`}
                        >
                            💼 경력
                        </button>
                    </div>

                    {careerType === "경력" && (
                        <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-5">
                            <h4 className="mb-6 font-extrabold text-emerald-700">
                                • 경력 상세 정보
                            </h4>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="mb-3 block text-sm font-extrabold text-slate-700">
                                        ⏰ 경력 연수
                                    </label>
                                    <Input
                                        placeholder="예: 3년"
                                        className="h-12 rounded-lg border-emerald-200 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-extrabold text-slate-700">
                                        🏢 이전 회사명
                                    </label>
                                    <Input
                                        placeholder="예: 삼성전자"
                                        className="h-12 rounded-lg border-emerald-200 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-3 block text-sm font-extrabold text-slate-700">
                                        👤 직책/직무
                                    </label>
                                    <Input
                                        placeholder="예: 프론트엔드 개발자"
                                        className="h-12 rounded-lg border-emerald-200 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="my-6 border-t border-dashed border-emerald-200" />

                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h4 className="font-extrabold text-emerald-700">
                                        추가 경력 항목 (선택)
                                    </h4>
                                </div>

                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={addCareer}
                                    className="h-12 rounded-xl border-emerald-300 bg-white px-5 font-extrabold text-emerald-700 hover:bg-emerald-50"
                                >
                                    + 경력 추가
                                </Button>
                            </div>

                            {careers.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    여러 회사/직무 경력이 있으면 항목을 추가해 각각 입력할 수 있습니다.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {careers.map((career, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-emerald-200 bg-white p-4"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <h5 className="font-extrabold text-emerald-950">
                                                    경력 {index + 1}
                                                </h5>

                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() => removeCareer(index)}
                                                    className="h-12 rounded-lg border-0 bg-red-50 px-5 font-bold text-red-500 hover:bg-red-100"
                                                >
                                                    삭제
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <Input
                                                    placeholder="회사명"
                                                    value={career.company}
                                                    onChange={(e) =>
                                                        updateCareer(index, "company", e.target.value)
                                                    }
                                                    className="h-11 rounded-lg border-emerald-200 bg-white"
                                                />
                                                <Input
                                                    placeholder="직책/직무"
                                                    value={career.position}
                                                    onChange={(e) =>
                                                        updateCareer(index, "position", e.target.value)
                                                    }
                                                    className="h-11 rounded-lg border-emerald-200 bg-white"
                                                />
                                                <Input
                                                    placeholder="기간 (예: 2년 3개월)"
                                                    value={career.period}
                                                    onChange={(e) =>
                                                        updateCareer(index, "period", e.target.value)
                                                    }
                                                    className="h-11 rounded-lg border-emerald-200 bg-white"
                                                />
                                            </div>

                                            <textarea
                                                value={career.description}
                                                onChange={(e) =>
                                                    updateCareer(index, "description", e.target.value)
                                                }
                                                placeholder="이 경력에서의 핵심 업무/성과를 한두 줄로 입력 (선택)"
                                                className="mt-3 min-h-[76px] w-full resize-none rounded-lg border border-emerald-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-100"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <section className="grid grid-cols-2 gap-6">
                    <div className="rounded-[18px] border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
                        <div className="mb-3 flex items-start justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="text-blue-600">
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 3L21 8L12 13L3 8L12 3Z" stroke="currentColor" strokeWidth="2" />
                                            <path d="M21 12L12 17L3 12" stroke="currentColor" strokeWidth="2" />
                                            <path d="M21 16L12 21L3 16" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </div>

                                    <h3 className="text-xl font-extrabold text-slate-900">
                                        경력 기술
                                    </h3>

                                    <Info className="h-4 w-4 text-slate-400" />
                                </div>

                                <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-extrabold text-blue-600">
                                    {experiences.length}개
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                className="h-12 rounded-xl border-blue-200 bg-blue-50 px-5 font-extrabold text-blue-600 hover:bg-blue-100"
                            >
                                📁 경험 풀 불러오기
                            </Button>
                        </div>

                        <p className="mb-5 mt-4 text-sm leading-6 text-slate-500">
                            핵심 경험을 한 줄씩 추가해두면
                            <br />
                            다음 단계 AI 생성 품질이 좋아
                            <br />
                            집니다.
                        </p>

                        <div className="flex gap-3">
                            <Input
                                value={experienceInput}
                                onChange={(e) => setExperienceInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") addExperience()
                                }}
                                placeholder="예시) 프론트엔드 개발 프로"
                                className="h-14 rounded-xl border-blue-200 bg-white px-5 text-base shadow-none placeholder:text-slate-500"
                            />

                            <Button
                                type="button"
                                onClick={addExperience}
                                className="h-14 rounded-xl bg-blue-600 px-7 text-base font-extrabold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                            >
                                + 추가
                            </Button>
                        </div>

                        <p className="mt-3 text-xs text-blue-400">
                            Enter 키로도 바로 추가됩니다.
                        </p>

                        <div className="mt-4 min-h-[60px] rounded-xl border border-blue-200 bg-white p-3">
                            {experiences.length === 0 ? (
                                <p className="text-sm italic leading-6 text-slate-500">
                                    경력을 추가해주세요. 지원하는 직무와 관련된 경험을 작성하면 좋습니다.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {experiences.map((item, index) => (
                                        <span
                                            key={`${item}-${index}`}
                                            className="flex items-center gap-3 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
                                        >
                                            {item}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExperiences((prev) =>
                                                        prev.filter((_, i) => i !== index)
                                                    )
                                                }
                                            >
                                                <X size={15} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[18px] border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
                        <div className="mb-3 flex items-start gap-2">
                            <Tag className="mt-1 h-6 w-6 text-blue-600" />

                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-extrabold text-slate-900">
                                        핵심 키워드
                                    </h3>

                                    <Info className="h-4 w-4 text-slate-400" />

                                    <span className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1 text-sm font-extrabold text-emerald-700">
                                        {keywords.length}개
                                    </span>
                                </div>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    키워드는 지원 직무와 연결되는 강점 중심으로 짧게 입력해주
                                    <br />
                                    세요.
                                </p>
                            </div>
                        </div>

                        <div className="mt-7 flex gap-3">
                            <Input
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") addKeyword()
                                }}
                                placeholder="예시) 커뮤니케이션 능력"
                                className="h-14 rounded-xl border-emerald-300 bg-white px-5 text-base shadow-none placeholder:text-slate-500"
                            />

                            <Button
                                type="button"
                                onClick={addKeyword}
                                className="h-14 rounded-xl bg-emerald-700 px-7 text-base font-extrabold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800"
                            >
                                + 추가
                            </Button>
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                            예: 문제 해결, 데이터 분석, React, 협업
                        </p>

                        <div className="mt-4 min-h-[60px] rounded-xl border border-emerald-200 bg-white p-3">
                            {keywords.length === 0 ? (
                                <p className="text-sm italic leading-6 text-slate-500">
                                    핵심 키워드를 추가해주세요. 직무 관련 기술 또는 역량을 작성하면 좋습니다.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {keywords.map((item, index) => (
                                        <span
                                            key={`${item}-${index}`}
                                            className="flex items-center gap-3 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
                                        >
                                            {item}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setKeywords((prev) =>
                                                        prev.filter((_, i) => i !== index)
                                                    )
                                                }
                                            >
                                                <X size={15} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <div className="fixed bottom-6 right-8 z-50 rounded-2xl bg-white p-4 shadow-2xl">
                <div className="flex items-center gap-5">
                    <div className="min-w-[170px]">
                        <div className="flex items-center gap-1 text-sm font-bold text-blue-600">
                            1 <span className="text-slate-400">/ 2</span>
                            <span className="ml-1 h-3 w-3 rounded-full bg-blue-500" />
                            <span className="h-2 w-2 rounded-full bg-blue-100" />
                        </div>
                        <div className="mt-2 text-lg font-extrabold text-slate-900">
                            기본 정보 입력
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="h-12 w-14 rounded-xl border-slate-200 bg-slate-50"
                    >
                        <Save className="h-5 w-5 text-slate-500" />
                    </Button>

                    <Button className="h-12 rounded-xl bg-blue-600 px-7 text-base font-extrabold text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
                        다음 단계
                        <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>

            <button className="fixed bottom-8 right-8 z-40 translate-x-28 rounded-full bg-blue-600 p-5 text-white shadow-xl">
                <HelpCircle size={28} />
            </button>
        </div>
    )
}