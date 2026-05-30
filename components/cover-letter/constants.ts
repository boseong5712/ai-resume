export const questionDetails = {
    "장단점에 관하여": [
        "장점을 발휘했던 구체적인 경험을 알려주세요.",
        "단점을 극복하기 위해 어떤 노력을 했나요?",
        "장단점이 지원 직무와 어떤 연관이 있나요?",
    ],
    "지원동기에 관하여": [
        "해당 회사를 선택한 구체적인 이유는 무엇인가요?",
        "지원 직무에 관심을 갖게 된 계기는 무엇인가요?",
        "회사의 어떤 점이 당신의 경력 목표와 부합하나요?",
    ],
    "입사 후 포부에 관하여": [
        "입사 후 1년 내에 이루고 싶은 목표는 무엇인가요?",
        "장기적으로 어떤 성장을 기대하시나요?",
        "회사에 어떤 기여를 하고 싶으신가요?",
    ],
    "나의 가치관에 관하여": [
        "일과 삶의 균형에 대해 어떻게 생각하시나요?",
        "직장에서 가장 중요하게 생각하는 가치는 무엇인가요?",
        "이러한 가치관이 형성된 계기는 무엇인가요?",
    ],
    "문제해결능력에 관하여": [
        "어려운 문제를 해결했던 경험을 알려주세요.",
        "문제 해결 과정에서 어떤 방법을 사용했나요?",
        "그 경험을 통해 어떤 것을 배웠나요?",
    ],
    "의사소통능력에 관하여": [
        "팀원들과의 의사소통 경험을 알려주세요.",
        "의견 충돌이 있었을 때 어떻게 해결했나요?",
        "효과적인 의사소통을 위해 어떤 노력을 했나요?",
    ],
    "팀워크와 리더십에 관하여": [
        "팀 프로젝트에서의 역할과 성과를 알려주세요.",
        "리더십을 발휘했던 경험이 있나요?",
        "팀워크를 위해 어떤 노력을 했나요?",
    ],
    "자기주도적 태도에 관하여": [
        "새로운 기술이나 지식을 습득한 경험을 알려주세요.",
        "어려운 상황에서 어떻게 극복했나요?",
        "자기계발을 위해 어떤 노력을 하고 있나요?",
    ],
} satisfies Record<string, string[]>

export type QuestionType = keyof typeof questionDetails

export const availableQuestions = Object.keys(questionDetails) as QuestionType[]

export const generatedDetailAnswers = [
    "SK하이닉스에서 임원으로 재직하며, 짧은 시간 내에 성과 평가 시스템을 분석하고 개선 방안을 제시한 경험이 있습니다. 이 과정에서 HTML/CSS에 대한 이해를 바탕으로 데이터 시각화 도구를 활용하여 임원진에게 직관적인 보고서를 제공하였고, 이는 빠른 의사결정에 큰 도움이 되었습니다. 이러한 경험은 삼성전자의 기획·전략 컨설턴트로서 성과 평가 및 개선 방안을 효율적으로 제시하는 데 기여할 수 있습니다.",
    "단점으로 지적받았던 것은 새로운 기술 트렌드에 대한 적응 속도였습니다. SK하이닉스에서 임원으로 재직하며, HTML/CSS와 같은 웹 기술의 중요성을 깨닫고 이를 보완하기 위해 관련 온라인 강좌를 수강하였습니다. 이러한 노력은 전략 기획의 디지털 전환 프로젝트에서 성과를 내는 데 큰 도움이 되었고, 삼성전자에서 컨설턴트로서 성과 평가 및 개선 방안 수립에 강점으로 작용할 것입니다.",
    "삼성전자 기획·전략 컨설턴트 역할에 저의 강점과 약점이 어떻게 연관되는지 설명드리겠습니다. SK하이닉스에서 2개월 동안 임원으로 근무하면서 성과 평가 및 개선 방안을 제시한 경험은 저의 분석적 사고와 문제 해결 능력을 강화했습니다. 이는 기획 및 전략 분야에서 필수적인 역량이며, 제가 컨설턴트로서 가치 있는 통찰을 제공할 수 있는 기반이 됩니다.",
]

export const fallbackDetailAnswer = "관련 경험과 배운 점을 바탕으로 지원 직무와 연결되는 구체적인 답변을 작성하겠습니다."

export const generatedCoverLetter = `저는 삼성전자의 기획•전략 컨설턴트 직무에 지원하며, 문제를 구조적으로 분석하고 실행 가능한 개선안을 제시하는 역량을 강점으로 삼고 있습니다. SK하이닉스에서 임원으로 근무하며 성과 평가 및 개선 방안을 검토했고, 정보처리기사 자격과 HTML/CSS 이해를 바탕으로 성과 지표를 더 명확하게 보여주는 방식을 고민했습니다. 단순히 수치를 나열하는 것이 아니라, 의사결정자가 빠르게 판단할 수 있도록 성과 흐름과 개선 포인트가 드러나는 구조를 만드는 데 집중했습니다. 이러한 경험은 삼성전자에서도 현장의 문제를 구체적으로 파악하고 실질적인 전략으로 연결하는 기반이 될 것입니다.

그 과정에서 성과 측정의 정확도를 높이는 방향을 제안하며 데이터 기반 사고와 문제 해결력을 키웠습니다. 짧은 기간이었지만 제한된 정보 속에서도 우선순위를 정하고, 필요한 자료를 빠르게 정리해 실질적인 개선 방향으로 연결하는 경험을 쌓았습니다.

반면 경력 기간이 길지 않다는 점은 보완해야 할 부분입니다. 이를 극복하기 위해 새로운 기술과 분석 방법을 꾸준히 학습하고 있으며, 삼성전자 컨설턴트 직무에서도 빠른 학습력과 전략적 사고를 바탕으로 현장의 문제를 명확히 파악하고 실행 가능한 전략을 제시하는 인재로 기여하겠습니다.`

export const polishOptions = [
    { id: "human", icon: "😊", title: "인간미 첨가", description: "AI 티 제거, 자연스럽게" },
    { id: "consistent", icon: "📐", title: "통일성 높이기", description: "일관된 문체와 흐름" },
    { id: "professional", icon: "💼", title: "전문적으로", description: "비즈니스 톤으로" },
    { id: "clear", icon: "🔍", title: "명확하게", description: "이해하기 쉽게" },
    { id: "story", icon: "📖", title: "스토리텔링", description: "이야기처럼 구성" },
] as const

export type PolishOptionId = typeof polishOptions[number]["id"]

export const polishDirectionGroups: Record<PolishOptionId, Array<{ id: string; title: string; description: string }>> = {
    human: [
        { id: "natural", title: "자연스러운 표현", description: "딱딱한 문체를 부드럽게" },
        { id: "personal", title: "개인적 경험 강조", description: "개인의 감정과 경험이 드러나게" },
        { id: "emotion", title: "감정 표현 추가", description: "적절한 감정과 느낌 표현" },
        { id: "story", title: "스토리텔링 강화", description: "이야기처럼 흥미롭게 구성" },
        { id: "empathy", title: "공감대 형성", description: "읽는 사람이 공감할 수 있게" },
    ],
    consistent: [
        { id: "tone", title: "문체 통일", description: "전체적으로 일관된 어조와 문체" },
        { id: "tense", title: "시제 통일", description: "과거·현재 시제의 일관성" },
        { id: "terms", title: "용어 통일", description: "같은 개념에 대한 용어 통일" },
        { id: "balance", title: "문단 균형", description: "문단별 길이와 내용의 균형" },
        { id: "logic", title: "논리적 흐름", description: "내용 전개의 논리적 연결" },
    ],
    professional: [
        { id: "business", title: "비즈니스 용어 강화", description: "적절한 업무 용어와 표현 사용" },
        { id: "results", title: "성과 중심 표현", description: "구체적 성과와 결과 부각" },
        { id: "leadership", title: "리더십 강조", description: "주도성과 리더십 역량 부각" },
        { id: "competency", title: "업무 역량 부각", description: "직무 관련 전문성과 역량 강조" },
        { id: "expertise", title: "직무 전문성 강조", description: "해당 분야의 전문 지식 표현" },
    ],
    clear: [
        { id: "simple", title: "쉬운 표현 사용", description: "복잡한 표현을 간단명료하게" },
        { id: "structure", title: "문장 구조 개선", description: "논리적이고 읽기 쉬운 구조" },
        { id: "examples", title: "구체적 예시 추가", description: "이해를 돕는 구체적 사례" },
        { id: "remove", title: "불필요한 표현 제거", description: "중복과 장황함 제거" },
        { id: "flow", title: "흐름 개선", description: "문단 간 자연스러운 연결" },
    ],
    story: [
        { id: "narrative", title: "이야기 구조로 재구성", description: "시작-전개-결말의 스토리 구조" },
        { id: "scene", title: "상황 묘사 강화", description: "생생한 상황과 배경 설명" },
        { id: "conflict", title: "갈등과 해결 부각", description: "어려움과 극복 과정 강조" },
        { id: "growth", title: "성장 스토리", description: "변화와 성장 과정 부각" },
        { id: "hook", title: "흥미로운 시작", description: "관심을 끄는 도입부 구성" },
    ],
}

export const polishSubtitles: Record<PolishOptionId, string> = {
    human: "AI 티를 제거하고 자연스럽고 따뜻한 표현으로 만들어드립니다",
    consistent: "일관된 문체와 흐름으로 완성도를 높여드립니다",
    professional: "비즈니스 환경에 적합한 전문적인 표현으로 다듬어드립니다",
    clear: "이해하기 쉽고 명확한 표현으로 개선해드립니다",
    story: "매력적인 이야기 구조로 재구성해드립니다",
}
