/* eslint-disable unicorn/prefer-add-event-listener */
import { t } from "@lingui/macro";
import { useMutation } from "@tanstack/react-query";

import { toast } from "@/client/hooks/use-toast";

import { findResumeById } from "./resume";

export const printResume = async (data: { id: string }) => {
  const resume = await findResumeById({ id: data.id });
  const newUrl = import.meta.env.DEV
    ? "/artboard/preview"
    : "/Reactive-Resume/artboard/#/artboard/preview";
  const newWindow = window.open(newUrl, "_blank");
  // newWindow?.postMessage
  if (newWindow && resume) {
    newWindow.onload = () => {
      newWindow.postMessage({ type: "SET_RESUME", payload: resume.data }, "*");
      setTimeout(() => {
        newWindow.print();
      }, 1000);
    };
  }

  return {
    url: `${window.location.origin}${newUrl}`,
  };
};

export const getShareLink = async (data: { id: string }) => {
  const resume = await findResumeById({ id: data.id });
  if (!resume) {
    return null;
  }
  const newUrl = import.meta.env.DEV
    ? "/artboard/preview"
    : "/Reactive-Resume/artboard/#/artboard/preview";
  return `${window.location.origin}${newUrl}?resumeId=${resume.id}`;
};

export const usePrintResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: printResumeFn,
  } = useMutation({
    mutationFn: printResume,
    onError: (error) => {
      const message = error.message;

      toast({
        variant: "error",
        title: t`Oops, the server returned an error.`,
        description: message,
      });
    },
  });

  return { printResume: printResumeFn, loading, error };
};
