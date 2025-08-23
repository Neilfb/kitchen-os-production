import * as z from "zod"

export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative").optional(),
  section: z.string().optional(),
  isVisible: z.boolean(),
  category: z.string().optional(),
  image: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  dietary: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().optional(),
})

export type MenuItemFormData = z.infer<typeof menuItemSchema>
