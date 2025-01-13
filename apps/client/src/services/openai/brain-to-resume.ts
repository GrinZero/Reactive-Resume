import { t } from "@lingui/macro";
import { ResumeDto } from "@reactive-resume/dto";
import { jsonrepair } from "jsonrepair";

import { DEFAULT_MODEL } from "@/client/constants/llm";
import { useOpenAiStore } from "@/client/stores/openai";

import { openai } from "./client";

const getPrompt = (resumeStr: string, promptInput: string, jobDescription: string) => {
  const prompt = `## ResumeData
${resumeStr}
## Prompt
${promptInput}

## Job Description
${jobDescription}

## Output
Directly return the improved ResumeData in JSON format. Follow these rules strictly:

The JSON should reflect a fully improved and optimized version of the resume.
Remove unnecessary sections and include only content relevant to the job description.
No additional explanation, comments, or formatting should be included. Return only the final JSON string.
`;
  return prompt;
};

export const brainToResume = async (
  resumeStr: string,
  promptInput: string,
  jobDescription: string,
) => {
  const { model } = useOpenAiStore.getState();
  const prompt = getPrompt(resumeStr, promptInput, jobDescription);
  const resultStr: string[] = [];
  let messages = [{ role: "user" as const, content: prompt }] as {
    role: "user" | "assistant";
    content: string;
  }[];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
  while (true) {
    const result = await openai().chat.completions.create({
      messages,
      model: model ?? DEFAULT_MODEL,
      temperature: 0,
      n: 1,
    });

    if (result.choices.length === 0) {
      throw new Error(t`OpenAI did not return any choices for your text.`);
    }

    let content = result.choices[0].message.content;
    if (!content) {
      throw new Error(t`OpenAI did not return any content for your text.`);
    }

    if (content.trimStart().startsWith("```json\n")) {
      content = content.trimStart().slice(7);
    }

    if (content.trimEnd().endsWith("```")) {
      content = content.slice(0, -3).trimEnd();
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
  } catch {
    throw new Error(
      t`Failed to parse OpenAI response as JSON. The response might be incomplete or malformed.`,
    );
  }
};
