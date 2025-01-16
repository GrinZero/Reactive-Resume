import { t } from "@lingui/macro";
import type { ResumeDto } from "@reactive-resume/dto";
import { jsonrepair } from "jsonrepair";

import { DEFAULT_MODEL } from "@/client/constants/llm";
import { useOpenAiStore } from "@/client/stores/openai";

import { openai } from "./client";

const getPrompt = (resumeStr: string, jobDescription: string) => {
  const prompt = `## Resume
\`\`\`json
${resumeStr}
\`\`\`

## Job Description
${jobDescription}
`;
  return prompt;
};

export const brainToResume = async (
  resumeStr: string,
  promptInput: string,
  jobDescription: string,
) => {
  const { model } = useOpenAiStore.getState();
  const prompt = getPrompt(resumeStr, jobDescription);
  const resultStr: string[] = [];
  let messages = [
    { role: "system" as const, content: promptInput },
    { role: "user" as const, content: prompt },
    // {
    //   role: "assistant",
    //   content: "```json",
    // },
  ] as {
    role: "user" | "assistant" | "system";
    content: string;
  }[];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
  while (true) {
    const result = await openai().chat.completions.create({
      messages,
      model: model ?? DEFAULT_MODEL,
      temperature: 0,
      n: 1,
      // stop: "\n```",
    });

    if (result.choices.length === 0) {
      throw new Error(t`OpenAI did not return any choices for your text.`);
    }

    let content = result.choices[0].message.content;
    if (!content) {
      throw new Error(t`OpenAI did not return any content for your text.`);
    }

    if (content === messages.at(-2)?.content) {
      throw new Error(t`OpenAI return duplicate content for your text.`);
    }

    if (content.trimStart().startsWith("```json\n")) {
      content = content.trimStart().slice(8);
    }

    if (content.trimEnd().endsWith("\n```")) {
      content = content.slice(0, -4).trimEnd();
    }

    resultStr.push(content);

    if (result.choices[0].finish_reason === "length") {
      // 继续对话，将之前的响应作为上下文
      messages = [
        ...messages,
        { role: "assistant" as const, content },
        { role: "user" as const, content: "继续" },
      ];
    } else {
      break; // 响应完成
    }
  }

  const fullContent = resultStr.join("");
  try {
    const aiData = JSON.parse(jsonrepair(fullContent)) as Pick<
      ResumeDto["data"],
      "basics" | "sections"
    >;
    return aiData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    throw new Error(
      t`Failed to parse OpenAI response as JSON. The response might be incomplete or malformed.`,
    );
  }
};
