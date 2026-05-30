type JobInfoRequest = {
    question?: string
    history?: Array<{
        role: "user" | "assistant"
        content: string
    }>
}

type RelatedLink = {
    title: string
    description: string
    url: string
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

function createPrompt(body: JobInfoRequest) {
    const history = (body.history || [])
        .slice(-8)
        .map((message) => `${message.role === "user" ? "사용자" : "AI"}: ${message.content}`)
        .join("\n")

    return `당신은 한국 취업 준비생을 돕는 직장 정보 검색 AI입니다.

답변 원칙:
- 기업, 직무, 복지, 연봉, 채용 준비, 면접 준비 질문에 한국어로 답하세요.
- 확실하지 않은 최신 수치나 회사 내부 정보는 단정하지 말고 "공식 채용 페이지, 공시자료, 잡플래닛/블라인드 등 최신 자료 확인이 필요하다"고 안내하세요.
- 답변은 5문장 이내로 간단하게 작성하세요.
- 마크다운 제목 기호(##), 굵게 표시(**), 표는 사용하지 마세요.
- 꼭 필요한 경우에만 짧은 목록을 사용하고, 각 항목은 한 문장으로 작성하세요.
- 자기소개서나 면접 준비와 연결되는 실천 팁은 한 문장만 포함하세요.
- 허위 정보나 과장된 수치를 만들지 마세요.

[이전 대화]
${history || "없음"}

[사용자 질문]
${body.question || ""}`
}

function createFallbackAnswer(question: string) {
    return [
        `질문하신 "${question}"은 공식 채용 페이지와 최근 공고를 함께 확인하는 것이 가장 정확합니다.`,
        "복지, 연봉, 조직문화는 회사와 직무, 시점에 따라 달라질 수 있으니 최신 자료 기준으로 판단하세요.",
        "자소서나 면접에서는 해당 회사의 특징을 단순히 언급하기보다 본인의 경험과 어떻게 연결되는지 짧게 설명하는 것이 좋습니다.",
    ].join("\n")
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Replaced by the clean related-link builder below.
function createLegacyRelatedLinks(question: string): RelatedLink[] {
    const normalized = question.replace(/\s+/g, " ")
    const wantsSalary = /(연봉|급여|초봉|보상|임금)/.test(normalized)
    const wantsCompany = /(기업|회사|복지|채용|네이버|카카오|삼성|현대|엘지|LG|SK|쿠팡|라인)/.test(normalized)
    return [
        {
            title: "워크넷 직업 정보",
            description: "직무 전망, 하는 일, 필요 역량을 확인할 수 있습니다.",
            url: "https://www.work.go.kr/consltJobCarpa/srch/jobInfoSrch/srchJobInfo.do",
        },
        {
            title: "고용24 채용정보",
            description: "공공 채용정보와 직무별 공고를 확인할 수 있습니다.",
            url: "https://www.work24.go.kr/",
        },
        ...(wantsCompany
            ? [{
                title: "금융감독원 전자공시 DART",
                description: "상장 기업의 사업보고서와 재무 정보를 확인할 수 있습니다.",
                url: "https://dart.fss.or.kr/",
            }]
            : []),
        ...(wantsSalary
            ? [{
                title: "고용노동부 임금직무정보시스템",
                description: "직무와 산업별 임금 정보를 참고할 수 있습니다.",
                url: "https://www.wage.go.kr/",
            }]
            : []),
    ].slice(0, 4)
}

function createRelatedLinks(question: string): RelatedLink[] {
    const normalized = question.replace(/\s+/g, " ").trim()
    const encoded = encodeURIComponent(normalized)
    const wantsSalary = /(연봉|급여|초봉|보상|임금|salary|wage)/i.test(normalized)
    const wantsCompany = /(기업|회사|복지|채용|네이버|카카오|삼성|현대|포스코|LG|SK|쿠팡|라인)/i.test(normalized)

    const links: RelatedLink[] = [
        {
            title: "워크넷 직업 정보",
            description: "직무 전망, 하는 일, 필요한 역량을 확인할 수 있습니다.",
            url: "https://www.work.go.kr/consltJobCarpa/srch/jobInfoSrch/srchJobInfo.do",
        },
        {
            title: "잡코리아 채용 정보",
            description: "기업명과 직무 키워드로 실제 채용 공고를 확인할 수 있습니다.",
            url: `https://www.jobkorea.co.kr/Search/?stext=${encoded}`,
        },
        {
            title: "사람인 채용 정보",
            description: "지원하려는 직무와 기업의 채용 공고를 비교해볼 수 있습니다.",
            url: `https://www.saramin.co.kr/zf_user/search?searchword=${encoded}`,
        },
        ...(wantsCompany
            ? [
                  {
                      title: "금융감독원 전자공시 DART",
                      description: "상장 기업의 사업보고서와 재무 정보를 확인할 수 있습니다.",
                      url: "https://dart.fss.or.kr/",
                  },
              ]
            : []),
        ...(wantsSalary
            ? [
                  {
                      title: "고용노동부 임금직무정보시스템",
                      description: "직무와 산업별 임금 정보를 참고할 수 있습니다.",
                      url: "https://www.wage.go.kr/",
                  },
              ]
            : []),
    ]

    return links.filter((link) => !/google\./i.test(link.url)).slice(0, 4)
}

function sanitizeAnswerText(text: string) {
    return text
        .split("\n")
        .filter((line) => !/google\.[^\s)]*|google\.com\/search/i.test(line))
        .join("\n")
        .trim()
}

export async function POST(request: Request) {
    let body: JobInfoRequest

    try {
        body = (await request.json()) as JobInfoRequest
    } catch {
        return Response.json({ error: "요청 본문을 읽을 수 없습니다." }, { status: 400 })
    }

    const question = body.question?.trim()
    if (!question) {
        return Response.json({ error: "질문을 입력해주세요." }, { status: 400 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    const openAIApiKey = process.env.OPENAI_API_KEY

    if (provider === "gemini" && !geminiApiKey) {
        return Response.json({ text: createFallbackAnswer(question), links: createRelatedLinks(question), model, provider, fallback: true })
    }

    if (provider === "openai" && !openAIApiKey) {
        return Response.json({ text: createFallbackAnswer(question), links: createRelatedLinks(question), model, provider, fallback: true })
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
                    instructions: "당신은 취업 준비생을 위한 직장 정보 검색 AI입니다. 불확실한 최신 정보는 단정하지 말고 확인 방법을 안내하세요. 답변은 간단하게 쓰고 마크다운 기호를 쓰지 마세요.",
                    input: createPrompt(body),
                    max_output_tokens: 600,
                }),
            })

            if (!response.ok) return Response.json({ text: createFallbackAnswer(question), links: createRelatedLinks(question), model, provider, fallback: true })

            const data = (await response.json()) as OpenAIResponse
            const text = sanitizeAnswerText(getOpenAIOutputText(data))
            return Response.json({ text: text || createFallbackAnswer(question), links: createRelatedLinks(question), model, provider, fallback: !text })
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
                                text: "당신은 취업 준비생을 위한 직장 정보 검색 AI입니다. 불확실한 최신 정보는 단정하지 말고 확인 방법을 안내하세요. 답변은 간단하게 쓰고 마크다운 기호를 쓰지 마세요.",
                            },
                        ],
                    },
                    contents: [{ parts: [{ text: createPrompt(body) }] }],
                    generationConfig: { maxOutputTokens: 600 },
                }),
            },
        )

        if (!response.ok) return Response.json({ text: createFallbackAnswer(question), links: createRelatedLinks(question), model, provider, fallback: true })

        const data = (await response.json()) as GeminiResponse
        const text = sanitizeAnswerText(getGeminiOutputText(data))
        return Response.json({ text: text || createFallbackAnswer(question), links: createRelatedLinks(question), model, provider, fallback: !text })
    } catch {
        return Response.json({ text: createFallbackAnswer(question), links: createRelatedLinks(question), model, provider, fallback: true })
    }
}
