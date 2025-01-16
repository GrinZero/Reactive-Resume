import { t } from "@lingui/macro";
import { CircleNotch, PenNib } from "@phosphor-icons/react";
import type { CreateResumeDto } from "@reactive-resume/dto";
import { defaultResumeData } from "@reactive-resume/schema";
// import { defaultResumeData } from "@reactive-resume/schema";
import { Button, Label, RichInput, Switch, Tooltip } from "@reactive-resume/ui";
import { generateRandomName } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";
import deepmerge from "deepmerge";
import { sleep } from "openai/core";
import { useRef, useState } from "react";

import { toast } from "@/client/hooks/use-toast";
import { brainToResume } from "@/client/services/openai/brain-to-resume";
import { BRAIN_ID, createResume } from "@/client/services/resume";
import { useResumeStore } from "@/client/stores/resume";

import { getSectionIcon } from "../shared/section-icon";

const _a = `
6. 你需要额外新增 output 结构体，返回它的评分（0-10），如果你修改了内容，还需要返回 diff，例如：
{"basic":xxx,"sections":yyy,${JSON.stringify({
  output: {
    "basics.headline": { diff: ["原始信息", "新信息"], score: 5 },
    "sections.projects.0.name": {
      score: 10,
    },
  },
}).slice(1, -1)}}
`;

const getDefaultPrompt = (
  allowChangeContent = false,
) => `你将扮演一个资深、严格的 HR，你需要帮助我优化我的简历，你的工作方式是：
首先，由我提供我的简历以及工作描述。其中，简历将是 json 格式，工作描述则是纯文本。例如：
## Resume
\`\`\`json
{xxx}
\`\`\`

## Job Description
...



请注意！！！你必须重点关注包含富文本字符串的「summary」
请注意！！！你必须重点关注包含富文本字符串的「summary」
请注意！！！你必须重点关注包含富文本字符串的「summary」

接下来，你需要根据据「Job Description」，对我的「Resume」中的每一个 summary 对应的内容进行优化，优化规则是：
1. 根据内容和工作的匹配度，匹配度高的优先
2. 内容的重要性，重要的优先
3. 内容呈现的业务价值，价值高的优先
${allowChangeContent ? "4. 你需要基于「star 法则」优化内容，保持重要细节的完整，优化内容的质量和数据的完整，你还可以对内容做进行删除、排序操作" : "4. 你只可以对内容进行删除、排序"}


请注意，为了防止我无法解析你的返回，你需要直接返回能被 JSON.parse 直接解析的 JSON 字符串的简历。

！！！不要增加或者包含无用的空格，不能携带 markdown 格式，返回内容前后不要有额外的语句。！！！

你现在充满热情，已经迫不及待要开始解析数据并进行优化了！现在，我将为你提供我的简历以及工作描述，让我们开始令人兴奋的优化工作吧！
`;

export const AISection = () => {
  const id = useResumeStore((state) => state.resume.id);
  const data = useResumeStore((state) => state.resume.data);
  const [jobDescription, setJobDescription] = useState("");
  const [allowChangeContent, setAllowChangeContent] = useState(true);
  const [promptInput, setPromptInput] = useState(() => getDefaultPrompt(allowChangeContent));
  const windowRef = useRef<Window | null>(null);

  const [resumeData, setResumeData] = useState<typeof data>();
  const resumeMeta = useRef<CreateResumeDto>();

  const [showPromptInput, setShowPromptInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const resumeData = {
        basics: data.basics,
        sections: data.sections,
      };

      const aiData = await brainToResume(JSON.stringify(resumeData), promptInput, jobDescription);

      const _newData = deepmerge(
        {
          basics: defaultResumeData.basics,
          sections: defaultResumeData.sections,
        },
        {
          ...aiData,
          // metadata: data.metadata,
        },
      );

      const newData = {
        ..._newData,
        metadata: data.metadata,
      };

      const setResume2Window = () => {
        windowRef.current?.postMessage(
          {
            type: "SET_RESUME",
            payload: newData,
          },
          "*",
        );
        windowRef.current?.focus();
      };

      if (!windowRef.current) {
        windowRef.current = window.open(
          import.meta.env.DEV
            ? "/artboard/preview"
            : "/Reactive-Resume/artboard/#/artboard/preview",
          "_blank",
        );
        await new Promise((resolve) => {
          windowRef.current?.addEventListener("load", resolve);
          windowRef.current?.addEventListener("close", () => {
            windowRef.current = null;
          });
        });
        await sleep(500);
      }

      if (windowRef.current) {
        setResume2Window();
      }
      setResumeData(newData);
    } catch (error) {
      toast({
        variant: "error",
        title: t`Oops, the server returned an error.`,
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resumeData) return;

    if (!resumeMeta.current) {
      const title = `ai-${generateRandomName()}`;
      resumeMeta.current = {
        id: crypto.randomUUID(),
        title,
        slug: slugify(title),
        visibility: "private",
      };
    }

    await createResume(resumeMeta.current, resumeData);
    toast({
      variant: "success",
      title: t`Resume saved successfully!`,
    });
  };

  if (id !== BRAIN_ID) {
    return null;
  }
  return (
    <section id="ai" className="grid gap-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          {getSectionIcon("ai")}
          <h2 className="line-clamp-1 text-2xl font-bold lg:text-3xl">{t`AI`}</h2>
        </div>
      </header>
      <main className="grid gap-y-4">
        <p className="leading-relaxed">
          {t`Paste your preferred job description here and let AI help you optimize your resume.`}
        </p>

        <div className="space-y-1.5">
          <RichInput
            content={jobDescription}
            onChange={(content) => {
              setJobDescription(content);
            }}
          />
          {showPromptInput && (
            <RichInput
              hideToolbar
              content={promptInput}
              onChange={(content) => {
                setPromptInput(content);
              }}
            />
          )}

          <p className="text-xs leading-relaxed opacity-75">
            {t`If you are not satisfied with the new resume, you can`}
            <Button
              className="mx-[0.25em] text-xs font-bold"
              variant="link"
              onClick={() => {
                setShowPromptInput((v) => !v);
              }}
            >
              {t`optimize`}
            </Button>
            {t`the prompt words.`}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-x-4">
            <Switch
              id="metadata.css.visible"
              checked={allowChangeContent}
              onCheckedChange={(checked) => {
                setAllowChangeContent(checked);
                setPromptInput(getDefaultPrompt(checked));
              }}
            />
            <Label htmlFor="metadata.css.visible">{t`Allow Change Content`}</Label>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <Tooltip content="This action will ignore max tokens limit">
            <Button className="gap-2" disabled={loading} onClick={handleGenerate}>
              {loading ? <CircleNotch className="animate-spin" /> : <PenNib />}
              {t`Generate`}
            </Button>
          </Tooltip>
          <Button className="flex-1" disabled={!resumeData} onClick={handleSave}>
            {t`Save Changes`}
          </Button>
        </div>
      </main>
    </section>
  );
};
