import { t } from "@lingui/macro";
import {
  CopySimple,
  FolderOpen,
  Lock,
  LockOpen,
  PencilSimple,
  TrashSimple,
} from "@phosphor-icons/react";
import { ResumeDto } from "@reactive-resume/dto";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";

import { useDialog } from "@/client/stores/dialog";

import { BaseCard } from "./base-card";

type Props = {
  resume: ResumeDto;
};

export const ResumeCard = ({ resume }: Props) => {
  const navigate = useNavigate();
  const { open } = useDialog<ResumeDto>("resume");
  const { open: lockOpen } = useDialog<ResumeDto>("lock");

  const template = resume.data.metadata.template;
  const lastUpdated = dayjs().to(resume.updatedAt);

  const onOpen = () => {
    navigate(`/builder/${resume.id}`);
  };

  return (
    <DropdownMenu>
      <BaseCard className="cursor-pointer space-y-0" onClick={onOpen}>
        <AnimatePresence>
          {resume.locked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm"
            >
              <Lock size={42} />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end space-y-0.5 p-4 pt-12",
            "bg-gradient-to-t from-background/80 to-transparent",
          )}
        >
          <h4 className="line-clamp-2 font-medium">{resume.title}</h4>
          <p className="line-clamp-1 text-xs opacity-75">{t`Last updated ${lastUpdated}`}</p>
        </div>

        <img
          src={`${import.meta.env.BASE_URL}templates/jpg/${template}.jpg`}
          alt={template}
          className="rounded-sm opacity-80"
        />
      </BaseCard>
    </DropdownMenu>
  );
};
