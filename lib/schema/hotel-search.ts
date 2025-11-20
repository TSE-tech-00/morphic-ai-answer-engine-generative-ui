import { z } from 'zod'

export const hotelSearchSchema = z.object({
  textQuery: z.string().describe("Search query, e.g. 'Tokyo'").min(1),
  type: z.string().optional().describe("Restrict by type, e.g. 'hotel'"),
  language: z.string().optional().describe("Language code, default 'en'"),
  checkin: z.string().optional().describe('YYYY-MM-DD'),
  checkout: z.string().optional().describe('YYYY-MM-DD'),
  adults: z.number().optional().describe('Number of adults'),
  children: z.number().optional().describe('Number of children')
})

export type HotelSearchParams = z.infer<typeof hotelSearchSchema>


