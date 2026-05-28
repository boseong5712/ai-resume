type GenerateAction = "detail" | "draft" | "polish" | "integrate" | "situation" | "evaluate"

type CoverLetterContext = {
    company?: string
    job?: string
    careerType?: string
    keywords?: string[]
    tasks?: string[]
    experiences?: string[]
    situationSummary?: string
}

type GenerateRequest = {
    action?: GenerateAction
    context?: CoverLetterContext
    question?: string
    detailQuestion?: string
    detailAnswers?: string[]
    targetLength?: number | string
    answers?: Array<{
        question?: string
        answer?: string
    }>
    text?: string
    situation?: string
    polishDirection?: string
    customRequest?: string
}

type GeminiResponse = {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string
            }>
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

function normalizeTargetLength(value: GenerateRequest["targetLength"]) {
    const parsed = typeof value === "number" ? value : Number(value)
    if (!Number.isFinite(parsed)) return 1000
    return Math.min(3000, Math.max(300, Math.round(parsed)))
}

function formatContext(context: CoverLetterContext = {}) {
    return [
        `지원 회사: ${context.company || "미입력"}`,
        `지원 직무: ${context.job || "미입력"}`,
        `경력 구분: ${context.careerType || "미입력"}`,
        `핵심 키워드: ${(context.keywords || []).join(", ") || "미입력"}`,
        `주요 업무: ${(context.tasks || []).join(", ") || "미입력"}`,
        `경험/경력: ${(context.experiences || []).join(" / ") || "미입력"}`,
        `개인 상황 요약: ${context.situationSummary || "미입력"}`,
    ].join("\n")
}

function createPrompt(body: GenerateRequest) {
    const context = formatContext(body.context)
    const targetLength = normalizeTargetLength(body.targetLength)
    const minLength = Math.max(0, targetLength - 50)
    const maxLength = targetLength + 50

    if (body.action === "detail") {
        return `다음 자기소개서 항목의 세부 질문에 대한 답변 재료를 한국어로 작성하세요.

[지원자 정보]
${context}

[자기소개서 항목]
${body.question || "미입력"}

[상세 질문]
${body.detailQuestion || "미입력"}

작성 규칙:
- 최종 자기소개서가 공백 제외 1000자 이내가 될 수 있도록 핵심 경험을 충분히 담되 장황하지 않게 정리하세요.
- 상황, 본인의 행동, 결과 또는 배운 점이 드러나게 3~5문장으로 작성하세요.
- 지원 회사/직무와 연결될 수 있는 표현을 포함하세요.
- 입력에 없는 경력, 자격증, 수치 성과는 만들지 마세요.
- 답변 본문만 출력하세요.`
    }

    if (body.action === "situation") {
        return `사용자가 자유롭게 적은 개인 상황을 자기소개서 생성에 도움이 되는 한국어 요약 bullet로 정리하세요.

[사용자 입력]
${body.situation || body.text || "미입력"}

작성 규칙:
- 3~5개의 bullet로 작성하세요.
- 각 bullet은 "- "로 시작하세요.
- 지원 직무와 연결될 수 있는 경험, 역량, 동기, 보완 노력, 기여 가능성 중심으로 정리하세요.
- 사용자가 입력하지 않은 회사명, 경력, 자격증, 숫자 성과는 만들지 마세요.
- 표현은 자기소개서에 바로 활용할 수 있도록 자연스럽고 긍정적으로 다듬으세요.
- bullet 목록만 출력하세요.`
    }

    if (body.action === "evaluate") {
        return `당신은 기업 면접관이자 채용 평가위원입니다. 지원 직무 적합성을 기준으로 다음 자기소개서를 엄격하지만 공정하게 평가하세요.

[평가 제목]
${body.question || "미입력"}

[지원자 정보]
${context}

[자기소개서]
${body.text || "미입력"}

평가 규칙:
- 5개 항목을 각각 0~20점으로 평가하고 총점은 0~100점으로 계산하세요.
- 평가 항목은 직무 적합성, 논리성, 구체성, 표현력, 완성도입니다.
- 각 항목별로 점수, 평가 이유, 개선 방향을 제시하세요.
- 각 항목의 "suggestion"은 최소 2문장으로 작성하세요. 첫 문장은 무엇이 부족한지, 두 번째 문장은 어떤 문장/정보를 어느 문단에 추가하거나 재배치하면 좋은지 구체적으로 지시하세요.
- 직무 적합성은 지원 직무 요구 역량과 본문 경험의 연결 방식, 논리성은 문단 순서와 주장-근거 연결, 구체성은 수치/기간/역할/성과 보강, 표현력은 추상 표현을 행동 중심 문장으로 바꾸는 방법, 완성도는 중복 삭제와 도입-본문-마무리 구조 개선을 반드시 다루세요.
- 각 항목의 "reason"은 자기소개서 본문에 실제로 나온 핵심 경험과 특징을 반영해 작성하세요.
- 각 항목의 "suggestion"에는 자기소개서 문장을 직접 인용하지 말고, 어떤 방향으로 고치면 효과적인지만 구체적으로 설명하세요.
- 상세 피드백에는 글자수, 문단 수, 수치 표현 개수 같은 계량 설명을 쓰지 마세요. 실제 면접관이 지원자의 강점, 우려점, 추가 확인하고 싶은 점을 말하듯 자연스럽게 작성하세요.
- 상세 피드백은 같은 문장 구조를 반복하지 말고, 입력된 자기소개서의 경험·직무 적합성·태도에 맞춰 다르게 작성하세요.
- 개선사항에는 "기존 문장"과 "개선 문장"을 제시하세요. 개수를 2개나 4개로 제한하지 말고, 자기소개서 전체에서 실제로 개선이 필요한 문장을 모두 찾아 가능한 한 빠짐없이 포함하세요.
- 기존 문장과 개선 문장이 같거나 거의 같은 항목은 절대 포함하지 마세요. 실제 수정이 필요한 문장만 골라 더 구체적이고 자연스러운 문장으로 바꾸세요.
- 단, 의미가 완전히 중복되는 문장은 하나로 묶어도 됩니다. 각 개선사항은 자기소개서에 실제로 있는 문장을 우선 사용하고, 없는 사실을 새로 만들지 마세요.
- 반드시 아래 JSON 형식만 출력하세요. 마크다운 코드블록이나 추가 설명은 출력하지 마세요.

{
  "totalScore": 0,
  "summary": "전체 총평",
  "criteria": [
    { "name": "직무 적합성", "score": 0, "reason": "평가 이유", "suggestion": "개선 방향" },
    { "name": "논리성", "score": 0, "reason": "평가 이유", "suggestion": "개선 방향" },
    { "name": "구체성", "score": 0, "reason": "평가 이유", "suggestion": "개선 방향" },
    { "name": "표현력", "score": 0, "reason": "평가 이유", "suggestion": "개선 방향" },
    { "name": "완성도", "score": 0, "reason": "평가 이유", "suggestion": "개선 방향" }
  ],
  "detailFeedback": ["상세 피드백 1", "상세 피드백 2", "상세 피드백 3"],
  "improvements": [
    { "before": "기존 문장", "after": "개선 문장", "why": "개선 이유" }
  ]
}`
    }

    if (body.action === "polish") {
        return `다음 자기소개서 본문을 요청에 맞게 다듬어 한국어로 다시 작성하세요.

[지원자 정보]
${context}

[개선 방향]
${body.polishDirection || "자연스럽고 따뜻한 표현으로 개선"}

[직접 요구사항]
${body.customRequest || "없음"}

[원문]
${body.text || ""}

원문의 사실관계와 핵심 내용은 유지하고, AI가 쓴 듯한 반복적 표현은 줄이세요. 공백을 제외하고 1000자 이내로 정리하세요. 문단은 2~4개로 자연스럽게 나누세요. 수정된 자기소개서 전체 본문만 출력하세요.`
    }

    if (body.action === "integrate") {
        const answers = (body.answers || [])
            .filter((item) => item.answer?.trim())
            .map((item, index) => `[답변 ${index + 1}: ${item.question || "질문 미입력"}]\n${item.answer}`)
            .join("\n\n")

        return `아래 여러 자기소개서 답변을 하나의 완성된 자기소개서로 통합하세요.

[지원자 정보]
${context}

[개별 답변]
${answers || "없음"}

통합 규칙:
- 각 답변의 핵심 경험, 강점, 지원 동기, 포부를 자연스러운 흐름으로 재배치하세요.
- 여러 답변에 반복되는 첫 문단의 자기소개, 지원 회사/직무 소개, 동일한 경험 요약은 한 번만 남기세요.
- 중복 문장과 같은 의미의 표현은 삭제하고, 문단 사이 연결 문장을 보강하세요.
- 제공된 사실만 활용하고, 입력에 없는 회사, 경력, 자격증, 숫자 성과는 만들지 마세요.
- 제목, 목록, 마크다운 없이 본문만 출력하세요.
- 첫 문단은 지원자 소개와 핵심 역량 요약, 이후 문단은 경험과 문제 해결 과정, 마지막 문단은 지원 직무 기여와 포부 흐름으로 구성하세요.
- 읽기 편하도록 4~6개 문단으로 자연스럽게 줄바꿈하세요.
- 통합된 자기소개서 본문만 출력하세요.`
    }

    return `아래 정보를 사용해 한국어 자기소개서 답변을 작성하세요.

[지원자 정보]
${context}

[답변해야 할 질문]
${body.question || "미입력"}

[상세 답변]
${(body.detailAnswers || []).filter(Boolean).join("\n") || "없음"}

작성 규칙:
- 반드시 위 질문에 직접 답하는 형태로 작성하세요.
- 공백을 제외한 전체 글자수는 목표 ${targetLength}자에 최대한 맞추세요. 허용 범위는 ${minLength}~${maxLength}자입니다.
- 너무 짧게 끝내지 말고, 정보가 부족하더라도 제공된 사실을 바탕으로 문장 밀도와 설명을 조절해 목표 범위에 가깝게 작성하세요.
- 첫 문단은 질문 답변으로 바로 들어가지 말고, 지원자를 소개하는 4~5문장으로 구성하세요. 지원 회사, 지원 직무, 핵심 경험, 활용 역량, 기여 가능성을 자연스럽게 요약하세요.
- 두 번째 문단부터 질문에 대한 답변이 분명하게 드러나도록 경험/근거, 배운 점, 지원 직무 연결 순서로 구성하세요.
- 입력에 없는 경력, 회사, 자격증, 숫자 성과는 만들어내지 마세요.
- 상세 답변이 있으면 그 내용을 우선 활용하되 반복하지 말고 하나의 답변으로 자연스럽게 통합하세요.
- 제목, 목록, 마크다운 없이 본문만 출력하세요.
- 읽기 편하도록 3~5개 문단으로 자연스럽게 줄바꿈하세요.
- 본문만 출력하세요.`
}

function getGeminiOutputText(data: GeminiResponse) {
    return (data.candidates || [])
        .flatMap((candidate) => candidate.content?.parts || [])
        .map((part) => part.text || "")
        .join("\n")
        .trim()
}

function getOpenAIOutputText(data: OpenAIResponse) {
    return (data.output || [])
        .flatMap((item) => item.content || [])
        .filter((content) => content.type === "output_text" && content.text)
        .map((content) => content.text)
        .join("\n")
        .trim()
}

export async function POST(request: Request) {
    let body: GenerateRequest

    try {
        body = (await request.json()) as GenerateRequest
    } catch {
        return Response.json({ error: "요청 본문을 읽을 수 없습니다." }, { status: 400 })
    }

    if (!body.action || !["detail", "draft", "polish", "integrate", "situation", "evaluate"].includes(body.action)) {
        return Response.json({ error: "지원하지 않는 AI 작업입니다." }, { status: 400 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    const openAIApiKey = process.env.OPENAI_API_KEY

    if (provider === "gemini" && !geminiApiKey) {
        return Response.json(
            { error: "GEMINI_API_KEY가 아직 설정되지 않았습니다.", code: "GEMINI_API_KEY_MISSING" },
            { status: 503 }
        )
    }

    if (provider === "openai" && !openAIApiKey) {
        return Response.json(
            { error: "OPENAI_API_KEY가 아직 설정되지 않았습니다.", code: "OPENAI_API_KEY_MISSING" },
            { status: 503 }
        )
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
                    instructions: "당신은 취업용 자기소개서 작성을 돕는 한국어 전문 에디터입니다. 제공된 사실만 활용하고 과장하거나 사실을 창작하지 마세요.",
                    input: createPrompt(body),
                    max_output_tokens: body.action === "integrate" ? 2200 : body.action === "draft" ? 1600 : body.action === "evaluate" ? 1400 : 900,
                }),
            })

            if (!response.ok) {
                const message = await response.text()
                console.error("OpenAI response error:", response.status, message)
                return Response.json({ error: "AI 응답 생성에 실패했습니다." }, { status: 502 })
            }

            const data = (await response.json()) as OpenAIResponse
            const text = getOpenAIOutputText(data)

            if (!text) {
                return Response.json({ error: "AI가 빈 답변을 반환했습니다." }, { status: 502 })
            }

            return Response.json({ text, model, provider })
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
                        parts: [
                            {
                                text: "당신은 취업용 자기소개서 작성을 돕는 한국어 전문 에디터입니다. 제공된 사실만 활용하고 과장하거나 사실을 창작하지 마세요.",
                            },
                        ],
                    },
                    contents: [
                        {
                            parts: [{ text: createPrompt(body) }],
                        },
                    ],
                    generationConfig: {
                        maxOutputTokens: body.action === "integrate" ? 2200 : body.action === "draft" ? 1600 : body.action === "evaluate" ? 1400 : 900,
                    },
                }),
            }
        )

        if (!response.ok) {
            const message = await response.text()
            console.error("Gemini response error:", response.status, message)
            return Response.json({ error: "AI 응답 생성에 실패했습니다." }, { status: 502 })
        }

        const data = (await response.json()) as GeminiResponse
        const text = getGeminiOutputText(data)

        if (!text) {
            return Response.json({ error: "AI가 빈 답변을 반환했습니다." }, { status: 502 })
        }

        return Response.json({ text, model, provider })
    } catch (error) {
        console.error("Gemini request failed:", error)
        return Response.json({ error: "AI 서버에 연결할 수 없습니다." }, { status: 502 })
    }
}
