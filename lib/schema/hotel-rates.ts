import { z } from 'zod'

export const occupancySchema = z.object({
  adults: z.number().int().min(1).describe('Number of adults in each selected room'),
  children: z.array(z.number().int()).optional().describe('The ages of children of each selected room')
})

export const sortSchema = z.object({
  field: z.enum(['top_picks', 'price']).describe('Criteria to sort by'),
  direction: z.enum(['ascending', 'descending']).optional().describe('Sort direction')
})

export const hotelRatesSearchSchema = z.object({
  // Location search methods (at least one required)
  hotelIds: z.array(z.string()).optional().describe('An array of hotel IDs to search for availability and pricing'),
  countryCode: z.string().optional().describe('The country code in ISO 2-letter format (e.g., "US" for United States)'),
  cityName: z.string().optional().describe('The name of the city to search for hotels in'),
  latitude: z.number().optional().describe('The latitude coordinate for location-based hotel searches'),
  longitude: z.number().optional().describe('The longitude coordinate for location-based hotel searches'),
  radius: z.number().int().optional().describe('The search radius in meters for location-based searches'),
  iataCode: z.string().optional().describe('The IATA code of the search location, typically an airport code'),
  placeId: z.string().optional().describe('The unique Place ID of the search location'),
  aiSearch: z.string().optional().describe('AI-powered hotel search based on a natural language query'),

  // Required fields
  occupancies: z.array(occupancySchema).describe('An array of objects specifying the number of guests per room'),
  currency: z.string().length(3).describe('The currency in which the prices will be displayed (ISO 3-letter code)'),
  guestNationality: z.string().length(2).describe('The guest\'s nationality in ISO 2-letter country code format'),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('The check-in date in YYYY-MM-DD format (ISO 8601)'),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('The check-out date in YYYY-MM-DD format (ISO 8601)'),

  // Optional filters
  timeout: z.number().int().optional().describe('The maximum time in seconds before the request times out'),
  maxRatesPerHotel: z.number().int().optional().describe('The number of room rates to return per hotel, sorted by price'),
  boardType: z.string().optional().describe('Filter results by board type (e.g., RO, BB, HB)'),
  refundableRatesOnly: z.boolean().optional().describe('If true, only refundable rates (RFN) will be included'),
  sort: z.array(sortSchema).optional().describe('Sorting criteria for the results'),
  roomMapping: z.boolean().optional().describe('Enable room mapping to retrieve the mappedRoomId for each room'),
  hotelName: z.string().optional().describe('A case-insensitive search for a hotel\'s name'),
  limit: z.number().int().min(1).max(5000).optional().describe('The maximum number of results to return (default 200, max 5000)'),
  offset: z.number().int().optional().describe('The number of results to skip for pagination'),
  minReviewsCount: z.number().int().optional().describe('The minimum number of reviews a hotel must have'),
  minRating: z.number().min(0).max(5).optional().describe('The minimum rating (on a scale of 0-5) required'),
  zip: z.string().optional().describe('The zip code of the search location'),
  starRating: z.array(z.number()).optional().describe('An array of hotel star ratings to include'),
  hotelTypeIds: z.array(z.number().int()).optional().describe('An array of hotel type IDs to filter the search results'),
  chainIds: z.array(z.number().int()).optional().describe('An array of hotel chain IDs to filter the search results'),
  facilities: z.array(z.number().int()).optional().describe('An array of facility IDs'),
  strictFacilityFiltering: z.boolean().optional().describe('If enabled, only hotels with all specified facilities will be returned'),
  stream: z.boolean().optional().describe('If true, enables streaming mode'),
  advancedAccessibilityOnly: z.boolean().optional().describe('If true, only hotels with advanced accessibility features will be returned'),
  feed: z.string().optional().describe('Which feed to use when searching for rates'),
  includeHotelData: z.boolean().optional().describe('If true, includes hotel data (name, main photo, address, rating) in the response')
})

export type HotelRatesSearchParams = z.infer<typeof hotelRatesSearchSchema>

