type InterviewMessage = {
    role: "interviewer" | "candidate"
    content: string
}

type InterviewProfile = {
    name?: string
    job?: string
    interviewType?: string
    resume?: unknown
    coverLetter?: unknown
}

type InterviewRequest = {
    action?: "start" | "answer"
    profile?: InterviewProfile
    history?: InterviewMessage[]
    answer?: string
}

type GeminiResponse = {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>
        }
    }>
}

type OpenAIResponse = {
    output?: Array<{
        content?: Array<{
            type?: string
            text?: string
        }>
    }>
}

const model = process.env.AI_MODEL || process.env.OPENAI_MODEL || process.env.GEMINI_MODEL || "gpt-5.4-mini"
const provider = model.startsWith("gemini-") ? "gemini" : "openai"

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

function compactDocument(document: unknown) {
    if (!document) return "선택하지 않음"
    return JSON.stringify(document).slice(0, 9000)
}

function createPrompt(body: InterviewRequest) {
    const profile = body.profile || {}
    const history = (body.history || [])
        .slice(-14)
        .map((message) => `${message.role === "interviewer" ? "면접관" : "지원자"}: ${message.content}`)
        .join("\n")

    return `당신은 실제 기업 채용 면접관입니다. 지원자의 답변을 돕거나 모범답안을 설명하지 말고, 자연스럽게 면접을 진행하세요.

[지원자 정보]
이름: ${profile.name || "지원자"}
희망 직무: ${profile.job || "미선택"}
면접 유형: ${profile.interviewType || "일반 면접"}
이력서: ${compactDocument(profile.resume)}
자기소개서: ${compactDocument(profile.coverLetter)}

[면접 진행 규칙]
- 반드시 한국어 존댓말을 사용하세요.
- 한 번에 하나의 질문만 하세요.
- 선택한 면접 유형과 희망 직무를 반영하세요.
- 이력서와 자기소개서의 실제 경험을 바탕으로 구체적인 질문을 하세요.
- 지원자의 답변을 받은 뒤에는 필요하면 짧은 꼬리 질문을 하세요.
- 답변에 대한 해설, 점수, 모범답안은 제공하지 마세요.
- 마크다운 제목, 굵게 표시, 표를 사용하지 마세요.
- 질문은 실제 면접관처럼 간결하게 작성하세요.

[현재 요청]
${body.action === "start" ? "첫 질문을 시작하세요." : `지원자의 새 답변을 바탕으로 다음 질문을 이어가세요.\n지원자 답변: ${body.answer || ""}`}

[이전 대화]
${history || "없음"}`
}

function createFallbackQuestion(body: InterviewRequest) {
    const profile = body.profile || {}
    const name = profile.name?.trim() || "지원자"
    const job = profile.job?.trim() || "지원"
    const answerCount = (body.history || []).filter((message) => message.role === "candidate").length
    const questions = [
        `${name}님, 반갑습니다. 먼저 ${job} 직무에 지원하신 이유와 본인이 적합하다고 생각하는 근거를 말씀해주세요.`,
        "말씀해주신 경험에서 본인이 맡은 역할과 가장 의미 있었던 성과를 구체적으로 설명해주세요.",
        "진행 과정에서 예상하지 못한 어려움은 무엇이었고, 이를 어떻게 해결하셨나요?",
        `그 경험에서 배운 점을 ${job} 직무에서 어떻게 활용하실 계획인가요?`,
        "협업 과정에서 의견 충돌이 발생했을 때 어떻게 조율하셨는지 사례를 들어 말씀해주세요.",
        "마지막으로 입사 후 이루고 싶은 목표를 말씀해주세요.",
    ]

    return questions[Math.min(answerCount, questions.length - 1)]
}

export async function POST(request: Request) {
    let body: InterviewRequest

    try {
        body = (await request.json()) as InterviewRequest
    } catch {
        return Response.json({ error: "요청 본문을 읽을 수 없습니다." }, { status: 400 })
    }

    if (!body.profile?.job?.trim()) {
        return Response.json({ error: "희망 직무를 선택해주세요." }, { status: 400 })
    }

    if (body.action === "answer" && !body.answer?.trim()) {
        return Response.json({ error: "답변을 입력해주세요." }, { status: 400 })
    }

    const fallbackText = createFallbackQuestion(body)
    const geminiApiKey = process.env.GEMINI_API_KEY
    const openAIApiKey = process.env.OPENAI_API_KEY

    if ((provider === "gemini" && !geminiApiKey) || (provider === "openai" && !openAIApiKey)) {
        return Response.json({ text: fallbackText, fallback: true, model, provider })
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
                    instructions: "당신은 실제 기업 채용 면접관입니다. 지원자의 서류와 희망 직무, 선택한 면접 유형을 반영해 질문을 하나씩 이어가세요.",
                    input: createPrompt(body),
                    max_output_tokens: 500,
                }),
            })

            if (!response.ok) return Response.json({ text: fallbackText, fallback: true, model, provider })

            const text = getOpenAIOutputText((await response.json()) as OpenAIResponse)
            return Response.json({ text: text || fallbackText, fallback: !text, model, provider })
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
            {
                method: "POST",
                headers: {
                    "x-goog-api-key": geminiApiKey || "",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: "당신은 실제 기업 채용 면접관입니다. 지원자의 서류와 희망 직무, 선택한 면접 유형을 반영해 질문을 하나씩 이어가세요." }],
                    },
                    contents: [{ parts: [{ text: createPrompt(body) }] }],
                    generationConfig: { maxOutputTokens: 500 },
                }),
            },
        )

        if (!response.ok) return Response.json({ text: fallbackText, fallback: true, model, provider })

        const text = getGeminiOutputText((await response.json()) as GeminiResponse)
        return Response.json({ text: text || fallbackText, fallback: !text, model, provider })
    } catch {
        return Response.json({ text: fallbackText, fallback: true, model, provider })
    }
}
