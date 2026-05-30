type ResumeFeedbackRequest = {
    resume?: Record<string, unknown>
}

type ResumeSectionFeedback = {
    section: string
    score: number
    level: "excellent" | "good" | "needsWork"
    summary: string
    strengths: string[]
    improvements: string[]
}

type FeedbackCard = {
    section: string
    field?: string
    title: string
    issue?: string
    suggestion: string
    importance?: "매우 중요" | "중요" | "보통" | "참고사항"
}

type ResumeFeedbackResult = {
    totalScore: number
    verdict: string
    sections: ResumeSectionFeedback[]
    strengths: string[]
    improvements: string[]
    strengthCards: FeedbackCard[]
    improvementCards: FeedbackCard[]
    detailedFeedback: Array<{
        section: string
        field?: string
        current: string
        issue: string
        suggestion: string
    }>
}

type GeminiResponse = {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

type OpenAIResponse = {
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>
}

const model = process.env.AI_MODEL || process.env.OPENAI_MODEL || process.env.GEMINI_MODEL || "gpt-5.4-mini"
const provider = model.startsWith("gemini-") ? "gemini" : "openai"

const sectionNames = ["기본정보", "학력사항", "경력사항", "보유기술", "자격증", "수상경력"] as const

const editableFields = {
    기본정보: ["사진", "이름", "이메일", "전화번호", "주소", "생년월일"],
    학력사항: ["학교명", "전공", "학위상태", "학점", "입학일", "졸업일"],
    경력사항: ["회사명", "직책", "시작일", "종료일", "재직여부", "담당업무 및 성과"],
    보유기술: ["카테고리", "스킬목록"],
    자격증: ["자격증명", "발급기관", "취득일", "만료일"],
    수상경력: ["수상명", "수여기관", "설명", "수상일"],
} satisfies Record<(typeof sectionNames)[number], string[]>

function valueOf(source: Record<string, unknown>, keys: string[]) {
    const value = keys.map((key) => source[key]).find((item) => item !== undefined && item !== null && String(item).trim() !== "")
    return String(value || "미입력")
}

function formatRows(rows: Array<[string, unknown]>) {
    return rows.map(([label, value]) => `${label}: ${String(value || "미입력")}`).join("\n")
}

function formatList(value: unknown, formatter: (item: Record<string, unknown>, index: number) => string) {
    if (!Array.isArray(value) || value.length === 0) return "미입력"
    return value
        .map((item, index) => formatter(typeof item === "object" && item ? (item as Record<string, unknown>) : { value: item }, index))
        .join("\n\n")
}

function getResumeSectionText(resume: Record<string, unknown> = {}) {
    return {
        기본정보: formatRows([
            ["사진", valueOf(resume, ["photoUrl", "photo", "imageUrl"]) !== "미입력" ? "등록됨" : "미입력"],
            ["이름", valueOf(resume, ["name"])],
            ["이메일", valueOf(resume, ["email"])],
            ["전화번호", valueOf(resume, ["phone", "phoneNumber", "mobile"])],
            ["주소", valueOf(resume, ["address"])],
            ["생년월일", valueOf(resume, ["birthDate", "birthday", "dateOfBirth"])],
        ]),
        학력사항: formatList(resume.education, (item, index) =>
            formatRows([
                [`학력 ${index + 1} 학교명`, valueOf(item, ["schoolName", "school"])],
                ["전공", valueOf(item, ["major"])],
                ["학위상태", valueOf(item, ["degree", "status"])],
                ["학점", `${valueOf(item, ["gpa"])} / ${valueOf(item, ["gpaScale"])}`],
                ["입학일", valueOf(item, ["admissionDate", "startDate"])],
                ["졸업일", valueOf(item, ["graduationDate", "endDate"])],
            ]),
        ),
        경력사항: formatList(resume.career, (item, index) =>
            formatRows([
                [`경력 ${index + 1} 회사명`, valueOf(item, ["companyName", "company"])],
                ["직책", valueOf(item, ["position", "role", "title"])],
                ["시작일", valueOf(item, ["startDate"])],
                ["종료일", valueOf(item, ["endDate"])],
                ["재직여부", item.isCurrent ? "재직중" : "퇴사/종료"],
                ["담당업무 및 성과", valueOf(item, ["description", "tasks", "achievements"])],
            ]),
        ),
        보유기술: formatList(resume.skillGroups, (item, index) =>
            formatRows([
                [`기술 ${index + 1} 카테고리`, valueOf(item, ["category"])],
                ["스킬목록", Array.isArray(item.skills) ? item.skills.join(", ") || "미입력" : valueOf(item, ["skills", "value"])],
            ]),
        ),
        자격증: formatList(resume.certificates, (item, index) =>
            formatRows([
                [`자격증 ${index + 1} 자격증명`, valueOf(item, ["name", "title"])],
                ["발급기관", valueOf(item, ["issuer", "organization"])],
                ["취득일", valueOf(item, ["acquiredDate", "date"])],
                ["만료일", item.noExpiry ? "만료 없음" : valueOf(item, ["expiryDate", "expireDate"])],
            ]),
        ),
        수상경력: formatList(resume.awards, (item, index) =>
            formatRows([
                [`수상 ${index + 1} 수상명`, valueOf(item, ["title", "name"])],
                ["수여기관", valueOf(item, ["organization", "issuer"])],
                ["설명", valueOf(item, ["description"])],
                ["수상일", valueOf(item, ["date", "awardedDate"])],
            ]),
        ),
    }
}

function clampScore(score: unknown) {
    const parsed = Number(score)
    if (!Number.isFinite(parsed)) return 50
    return Math.min(100, Math.max(0, Math.round(parsed)))
}

function getOpenAIOutputText(data: OpenAIResponse) {
    return (data.output || [])
        .flatMap((item) => item.content || [])
        .filter((content) => content.type === "output_text" && content.text)
        .map((content) => content.text)
        .join("\n")
        .trim()
}

function getGeminiOutputText(data: GeminiResponse) {
    return (data.candidates || [])
        .flatMap((candidate) => candidate.content?.parts || [])
        .map((part) => part.text || "")
        .join("\n")
        .trim()
}

function extractJson(text: string) {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
    const target = fenced || text
    const start = target.indexOf("{")
    const end = target.lastIndexOf("}")
    if (start === -1 || end === -1) return null
    try {
        return JSON.parse(target.slice(start, end + 1)) as Partial<ResumeFeedbackResult>
    } catch {
        return null
    }
}

function normalizeResult(input: Partial<ResumeFeedbackResult> | null, resume: Record<string, unknown>): ResumeFeedbackResult {
    const fallback = createFallbackResult(resume)
    if (!input) return fallback

    const sections = sectionNames.map((sectionName, index) => {
        const source = input.sections?.find((item) => item.section === sectionName) || input.sections?.[index]
        const score = clampScore(source?.score)
        return {
            section: sectionName,
            score,
            level: score >= 70 ? "excellent" : score >= 45 ? "good" : "needsWork",
            summary: source?.summary || fallback.sections[index].summary,
            strengths: source?.strengths?.length ? source.strengths.slice(0, 3) : fallback.sections[index].strengths,
            improvements: source?.improvements?.length ? source.improvements.slice(0, 3) : fallback.sections[index].improvements,
        } satisfies ResumeSectionFeedback
    })

    const totalScore = clampScore(input.totalScore ?? Math.round(sections.reduce((sum, item) => sum + item.score, 0) / sections.length))
    const detailedFeedback = (input.detailedFeedback?.length ? input.detailedFeedback : fallback.detailedFeedback)
        .filter((item) => sectionNames.includes(item.section as (typeof sectionNames)[number]))
        .slice(0, 10)

    return {
        totalScore,
        verdict: input.verdict || fallback.verdict,
        sections,
        strengths: input.strengths?.length ? input.strengths.slice(0, 4) : fallback.strengths,
        improvements: input.improvements?.length ? input.improvements.slice(0, 4) : fallback.improvements,
        strengthCards: input.strengthCards?.length ? input.strengthCards.slice(0, 5) : fallback.strengthCards,
        improvementCards: input.improvementCards?.length ? input.improvementCards.slice(0, 8) : fallback.improvementCards,
        detailedFeedback,
    }
}

function createFallbackResult(resume: Record<string, unknown> = {}): ResumeFeedbackResult {
    const sections = getResumeSectionText(resume)
    const feedbackSections = sectionNames.map((name) => {
        const text = sections[name]
        const missingCount = (text.match(/미입력/g) || []).length
        const score = text === "미입력" ? 20 : Math.max(30, 85 - missingCount * 10)
        return {
            section: name,
            score,
            level: score >= 70 ? "excellent" : score >= 45 ? "good" : "needsWork",
            summary: missingCount > 0 ? `${name}에서 수정 가능한 입력값 중 비어 있거나 보완할 항목이 있습니다.` : `${name}의 필수 입력값이 비교적 잘 채워져 있습니다.`,
            strengths: missingCount > 0 ? ["입력된 항목은 그대로 활용할 수 있습니다."] : ["이력서 생성기의 필수 입력칸이 잘 채워져 있습니다."],
            improvements: missingCount > 0 ? ["이력서 생성기에서 미입력 필드를 먼저 채워주세요."] : ["현재 내용을 더 구체적인 값으로 다듬으면 좋습니다."],
        } satisfies ResumeSectionFeedback
    })

    const improvementCards: FeedbackCard[] = [
        ...(sections.기본정보.includes("주소: 미입력")
            ? [{ section: "기본정보", field: "주소", title: "주소가 미입력됨", issue: "주소 입력칸이 비어 있습니다.", suggestion: "이력서 생성기의 기본정보 > 주소 칸에 실제 거주 지역을 입력하세요.", importance: "보통" as const }]
            : []),
        ...(sections.기본정보.includes("생년월일: 미입력")
            ? [{ section: "기본정보", field: "생년월일", title: "생년월일이 미입력됨", issue: "생년월일 입력칸이 비어 있습니다.", suggestion: "기본정보 > 생년월일 칸에 연도-월-일 형식으로 입력하세요.", importance: "보통" as const }]
            : []),
        ...(sections.경력사항.includes("담당업무 및 성과: 미입력")
            ? [{ section: "경력사항", field: "담당업무 및 성과", title: "담당업무 및 성과가 비어 있음", issue: "경력사항에서 실제 수정 가능한 담당업무 및 성과 칸이 비어 있습니다.", suggestion: "담당업무 및 성과 칸에 맡은 역할, 사용 기술, 결과를 한 문단으로 입력하세요.", importance: "매우 중요" as const }]
            : []),
        ...(sections.보유기술.includes("스킬목록: 미입력")
            ? [{ section: "보유기술", field: "스킬목록", title: "스킬목록이 비어 있음", issue: "보유기술의 스킬목록 칸이 비어 있습니다.", suggestion: "스킬목록에 실제 사용할 수 있는 기술명을 쉼표로 구분해 추가하세요.", importance: "중요" as const }]
            : []),
    ]

    if (improvementCards.length === 0) {
        improvementCards.push({
            section: "경력사항",
            field: "담당업무 및 성과",
            title: "성과 표현 구체화",
            issue: "입력값은 있으나 성과가 구체적으로 보이지 않을 수 있습니다.",
            suggestion: "담당업무 및 성과 칸에 숫자, 결과, 개선 효과를 포함해 문장을 보강하세요.",
            importance: "중요",
        })
    }

    const strengthCards: FeedbackCard[] = [
        ...(sections.자격증 !== "미입력"
            ? [{ section: "자격증", field: "자격증명", title: "자격증 정보 보유", suggestion: "자격증명을 활용해 직무 관련성을 강조할 수 있습니다.", importance: "참고사항" as const }]
            : []),
        ...(sections.보유기술 !== "미입력"
            ? [{ section: "보유기술", field: "스킬목록", title: "보유기술 입력 완료", suggestion: "스킬목록은 경력사항의 담당업무 및 성과와 연결해 보여주면 더 좋습니다.", importance: "참고사항" as const }]
            : []),
    ]

    return {
        totalScore: Math.round(feedbackSections.reduce((sum, item) => sum + item.score, 0) / feedbackSections.length),
        verdict: "이력서 생성기에서 실제로 수정할 수 있는 입력칸을 기준으로 보완점을 정리했습니다.",
        sections: feedbackSections,
        strengths: strengthCards.length ? strengthCards.map((item) => `${item.section}: ${item.title}`) : ["현재 입력된 항목을 바탕으로 보완 방향을 잡을 수 있습니다."],
        improvements: improvementCards.map((item) => `${item.section}: ${item.title}`),
        strengthCards,
        improvementCards,
        detailedFeedback: improvementCards.map((item) => ({
            section: item.section,
            field: item.field,
            current: item.issue || "현재 입력값을 확인하세요.",
            issue: item.issue || item.title,
            suggestion: item.suggestion,
        })),
    }
}

function createPrompt(resume: Record<string, unknown>) {
    const sections = getResumeSectionText(resume)

    return `당신은 이력서 생성기 안에서 사용자가 실제 입력칸을 고칠 수 있도록 피드백하는 채용 컨설턴트입니다.

절대 규칙:
- 이력서 생성기에 실제로 있는 입력칸만 피드백하세요.
- 없는 기능, 없는 항목, 파일 형식, 디자인, 레이아웃, 지원 직무 선택, 자기소개서 내용은 언급하지 마세요.
- 개선 제안은 사용자가 해당 입력칸에 그대로 참고해 수정할 수 있는 문장이나 값이어야 합니다.
- "좀 더 구체적으로 작성하세요"처럼 추상적으로만 말하지 말고, 어느 섹션의 어느 입력칸을 어떻게 고칠지 말하세요.
- 빈 입력칸은 해당 칸 이름을 직접 말하고, 이미 입력된 칸은 실제 입력값을 바탕으로 개선하세요.
- 반드시 JSON만 출력하세요.

실제 수정 가능한 입력칸:
- 기본정보: ${editableFields.기본정보.join(", ")}
- 학력사항: ${editableFields.학력사항.join(", ")}
- 경력사항: ${editableFields.경력사항.join(", ")}
- 보유기술: ${editableFields.보유기술.join(", ")}
- 자격증: ${editableFields.자격증.join(", ")}
- 수상경력: ${editableFields.수상경력.join(", ")}

JSON 형식:
{
  "totalScore": 0,
  "verdict": "총평",
  "sections": [
    {"section":"기본정보","score":0,"summary":"수정 가능한 입력칸 기준 요약","strengths":["강점"],"improvements":["개선점"]}
  ],
  "strengths": ["강점 요약"],
  "improvements": ["개선점 요약"],
  "strengthCards": [
    {"section":"자격증","field":"자격증명","title":"자격증 정보 보유","suggestion":"자격증명을 활용해 직무 관련성을 강조할 수 있습니다.","importance":"참고사항"}
  ],
  "improvementCards": [
    {"section":"기본정보","field":"주소","title":"주소가 미입력됨","issue":"주소 입력칸이 비어 있습니다.","suggestion":"기본정보 > 주소 칸에 실제 거주 지역을 입력하세요.","importance":"보통"}
  ],
  "detailedFeedback": [
    {"section":"경력사항","field":"담당업무 및 성과","current":"현재 입력된 내용 요약","issue":"문제점","suggestion":"이 입력칸에 넣을 개선 제안"}
  ]
}

[이력서 입력값]
기본정보:
${sections.기본정보}

학력사항:
${sections.학력사항}

경력사항:
${sections.경력사항}

보유기술:
${sections.보유기술}

자격증:
${sections.자격증}

수상경력:
${sections.수상경력}`
}

export async function POST(request: Request) {
    let body: ResumeFeedbackRequest

    try {
        body = (await request.json()) as ResumeFeedbackRequest
    } catch {
        return Response.json({ error: "요청 본문을 읽을 수 없습니다." }, { status: 400 })
    }

    const resume = body.resume || {}
    const geminiApiKey = process.env.GEMINI_API_KEY
    const openAIApiKey = process.env.OPENAI_API_KEY

    if (provider === "gemini" && !geminiApiKey) {
        return Response.json({ result: createFallbackResult(resume), model, provider, fallback: true })
    }

    if (provider === "openai" && !openAIApiKey) {
        return Response.json({ result: createFallbackResult(resume), model, provider, fallback: true })
    }

    try {
        if (provider === "openai") {
            const response = await fetch("https://api.openai.com/v1/responses", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${openAIApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    store: false,
                    input: createPrompt(resume),
                    max_output_tokens: 2000,
                }),
            })

            if (!response.ok) return Response.json({ result: createFallbackResult(resume), model, provider, fallback: true })

            const data = (await response.json()) as OpenAIResponse
            const result = normalizeResult(extractJson(getOpenAIOutputText(data)), resume)
            return Response.json({ result, model, provider, fallback: false })
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
            method: "POST",
            headers: {
                "x-goog-api-key": geminiApiKey || "",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: createPrompt(resume) }] }],
                generationConfig: { maxOutputTokens: 2000 },
            }),
        })

        if (!response.ok) return Response.json({ result: createFallbackResult(resume), model, provider, fallback: true })

        const data = (await response.json()) as GeminiResponse
        const result = normalizeResult(extractJson(getGeminiOutputText(data)), resume)
        return Response.json({ result, model, provider, fallback: false })
    } catch {
        return Response.json({ result: createFallbackResult(resume), model, provider, fallback: true })
    }
}
