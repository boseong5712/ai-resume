import type { EssayItem } from "./types"

export function countWithoutSpaces(text: string) {
    return text.replace(/\s/g, "").length
}

export function createIntegratedFallback(items: EssayItem[]) {
    const paragraphs: string[] = []
    const seen = new Set<string>()

    items
        .filter((item) => item.answer.trim())
        .forEach((item, itemIndex) => {
            const answerParagraphs = item.answer
                .split(/\n{2,}/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
            const paragraphsToUse = itemIndex === 0 ? answerParagraphs : answerParagraphs.slice(1)

            paragraphsToUse.forEach((paragraph) => {
                const normalized = paragraph.replace(/\s/g, "")
                if (!seen.has(normalized)) {
                    seen.add(normalized)
                    paragraphs.push(paragraph)
                }
            })
        })

    return paragraphs.join("\n\n")
}

export function downloadWordDocument(title: string, content: string) {
    const escapedTitle = title.replace(/[<>:"/\\|?*]/g, "").trim() || "자기소개서"
    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapedTitle}</title>
<style>
body { font-family: Malgun Gothic, Apple SD Gothic Neo, Arial, sans-serif; line-height: 1.8; color: #111827; }
h1 { font-size: 20px; margin-bottom: 24px; }
p { margin: 0 0 16px; white-space: pre-wrap; }
</style>
</head>
<body>
<h1>${escapedTitle}</h1>
${content.split(/\n{2,}/).map((paragraph) => `<p>${paragraph.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`).join("")}
</body>
</html>`
    const blob = new Blob(["\ufeff", html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${escapedTitle}.doc`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
}
