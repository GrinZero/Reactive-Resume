import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
import { Plus } from "@phosphor-icons/react";
import { createResumeSchema, ResumeDto } from "@reactive-resume/dto";
import { idSchema } from "@reactive-resume/schema";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BRAIN_ID, useCreateResume, useUpdateResume } from "@/client/services/resume";
import { useAuthStore } from "@/client/stores/auth";
import { useDialog } from "@/client/stores/dialog";

const formSchema = createResumeSchema.extend({ id: idSchema.optional() });

type FormValues = z.infer<typeof formSchema>;

export const BrainDialog = () => {
  const { isOpen, mode, payload, close } = useDialog<ResumeDto>("brain");
  const username = useAuthStore((store) => store.user?.username);

  const isCreate = mode === "create";
  const isUpdate = mode === "update";

  const { createResume, loading: createLoading } = useCreateResume();
  const { updateResume, loading: updateLoading } = useUpdateResume();

  const loading = createLoading || updateLoading;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: username ?? "", slug: slugify(username ?? "") },
  });

  useEffect(() => {
    const slug = slugify(form.watch("title"));
    form.setValue("slug", slug);
  }, [form.watch("title")]);

  useEffect(() => {
    if (!username) return;
    form.setValue("title", username);
    form.setValue("slug", slugify(username));
  }, [username]);

  const onSubmit = async (values: FormValues) => {
    if (isCreate) {
      await createResume({
        slug: values.slug,
        title: values.title,
        visibility: "private",
        id: BRAIN_ID,
      });
    }

    if (isUpdate) {
      if (!payload.item?.id) return;

      await updateResume({
        ...payload.item,
        title: values.title,
        slug: values.slug,
        id: BRAIN_ID,
      });
    }
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center space-x-2.5">
                  <Plus />
                  <h2>
                    {isCreate && t`Create the brain`}
                    {isUpdate && t`Update the brain`}
                  </h2>
                </div>
              </DialogTitle>
              <DialogDescription>
                {isCreate && t`Start building your resume by giving it a name.`}
                {isUpdate && t`Changed your mind about the name? Give it a new one.`}
              </DialogDescription>
            </DialogHeader>

            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Title`}</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-between gap-x-2">
                      <Input disabled {...field} className="flex-1" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t`Tip: You can name the resume referring to the position you are applying for.`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="slug"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Slug`}</FormLabel>
                  <FormControl>
                    <Input disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <div className="flex items-center">
                <Button
                  type={isUpdate ? "button" : "submit"}
                  disabled={loading}
                  className={cn(isCreate && "rounded-r-none")}
                  onClick={async () => {
                    if (!isUpdate) return;
                    const values = form.getValues();
                    await onSubmit(values);
                  }}
                >
                  {isCreate && t`Create`}
                  {isUpdate && t`Save Changes`}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
