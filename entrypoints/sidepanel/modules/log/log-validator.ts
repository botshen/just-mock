import { z } from 'zod'

export const addDataPoolSchema = z.object({
    pathRule: z.string().min(1, { message: 'pathRule must be at least 1 characters' }),
    method: z.string().min(1, { message: 'method must be at least 1 characters' }),
    code: z.string().min(1, { message: 'code must be at least 1 characters' }),
    Delay: z.string().min(1, { message: 'Delay must be at least 1 characters' }),
    response: z.string().min(1, { message: 'response must be at least 1 characters' }),
    comments: z.string().min(1, { message: 'comments must be at least 1 characters' }),
})
