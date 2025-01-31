import { z } from "zod"

export const ReportSchema = z.object({
  field: z.enum(["Incorrect band name", "Incorrect genres", "Issues with user comment", "Incorrect link"], {
    required_error: "Please select what needs to be corrected.",
  }),
  value: z.string().optional(),
  comment: z.string().optional(),
})

