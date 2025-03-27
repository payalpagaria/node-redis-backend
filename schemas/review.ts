import {z} from "zod"
export const reviewSchema=z.object({
    review:z.string().min(1),
    rating:z.string().min(1),

})
export type Review=z.infer<typeof reviewSchema>