import { t } from "@lingui/macro";
import { CircleNotch, PenNib } from "@phosphor-icons/react";
import { Button, RichInput } from "@reactive-resume/ui";
import { useRef, useState } from "react";

import { toast } from "@/client/hooks/use-toast";
import { brainToResume } from "@/client/services/openai/brain-to-resume";
import { BRAIN_ID } from "@/client/services/resume";
import { useResumeStore } from "@/client/stores/resume";

import { getSectionIcon } from "../shared/section-icon";

const DEFAULT_PROMPT = [
  `You are a professional resume optimizer with deep knowledge of various job roles. You will be provided with resume data and a job description. Your task is to analyze, improve, and rewrite the resume in detail to make it highly relevant and competitive for the given job description. Follow these steps carefully:

Analysis and Selection:

Analyze the job description and identify key skills, responsibilities, and qualifications required for the role.
Carefully match and highlight relevant experiences, projects, and skills from the resume. Omit irrelevant sections.
Detailed Improvements:

Rewrite each section of the resume to emphasize the most relevant and impactful information for the target role.
Use professional language and prioritize keywords or technologies explicitly mentioned in the job description.
Custom Enhancements:

Adapt technical skill levels, descriptions, and achievements to align with the priorities of the job.
Showcase measurable results and detailed project contributions wherever possible. Avoid fabricating information.
Standardization and Formatting:

Ensure the resume is structured logically and formatted consistently.
Use concise, action-oriented bullet points for achievements and responsibilities.
Highlight Priorities:

Pay attention to terms like “priority,” “preferred,” and “required” in the job description. Highlight or reorganize the resume to emphasize alignment with these aspects.`,
].join("");

export const AISection = () => {
  const id = useResumeStore((state) => state.resume.id);
  const data = useResumeStore((state) => state.resume.data);
  const [jobDescription, setJobDescription] = useState("");
  const [promptInput, setPromptInput] = useState(DEFAULT_PROMPT);
  const windowRef = useRef<Window | null>(null);

  const [showPromptInput, setShowPromptInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    if (!windowRef.current) {
      windowRef.current = window.open(
        import.meta.env.DEV ? "/artboard/preview" : "/Reactive-Resume/artboard/#/artboard/preview",
        "_blank",
      );
    }

    try {
      const resumeData = {
        basics: data.basics,
        sections: data.sections,
      };

      const aiData = await brainToResume(JSON.stringify(resumeData), promptInput, jobDescription);

      const newData = {
        ...aiData,
        metadata: data.metadata,
      };

      console.log("newData", newData);
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

      if (windowRef.current) {
        setResume2Window();
      }
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
          {t`Paste your preferred job information here and let AI help you optimize your resume.`}
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

        <Button className="gap-2" disabled={loading} onClick={handleGenerate}>
          {loading ? <CircleNotch className="animate-spin" /> : <PenNib />}
          {t`Generate`}
        </Button>
      </main>
    </section>
  );
};
