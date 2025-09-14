import { z } from "zod";
import { ReportSchema } from "./post-form-schemas";

export type ReportFormInput = z.infer<typeof ReportSchema>;

export type ReportPostFormProps = {
  setIsOpen: (isOpen: boolean) => void;
  postId: string;
};

export type ReportedPostData = {
  postId: string;
  field: string;
  value?: string;
  comment?: string;
};
