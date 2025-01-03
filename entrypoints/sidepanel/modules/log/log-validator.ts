import { z } from 'zod'

export const addDataPoolSchema = z.object({
    pathRule: z.string().min(1, { message: 'pathRule must be at least 1 characters' }),
    method: z.string().min(1, { message: 'method must be at least 1 characters' }),
    code: z.string().min(1, { message: 'code must be at least 1 characters' }),
    Delay: z.string().optional().refine((val) => {
        if (!val)
            return true
        return /^\d+$/.test(val)
    }, { message: 'Delay must be a non-negative integer' }),
    response: z.string().min(1, { message: 'response must be at least 1 characters' }),
})
