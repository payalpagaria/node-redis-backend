import { z, type TypeOf } from "zod";

export const RestaruntSchema=z.object({
    name:z.string().min(1),
    location:z.string().min(1),
    cuisins:z.array(z.string().min(1))

})
export const RestaruntDetailSchema=z.object({
    links:z.array(z.object({
        name:z.string().min(1),
        url:z.string().min(1)
    })),
    contact:z.array(z.object({
        phone:z.string().min(1),
        email:z.string().email()
    }))
})

export type Restaurant = z.infer<typeof RestaruntSchema>
export type RestaurantDetails = z.infer<typeof RestaruntDetailSchema>


