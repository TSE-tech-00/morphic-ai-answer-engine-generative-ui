import { tool } from 'ai'

import { hotelRatesSearchSchema } from '@/lib/schema/hotel-rates'
import { getBaseUrlString } from '@/lib/utils/url'

export const hotelRatesSearchTool = tool({
  description:
    'Search for hotel rates and availability across multiple hotels. Returns real-time pricing, room options, booking details, and hotel information. Use this when users want to find hotels with prices, check availability, or compare rates.',
  parameters: hotelRatesSearchSchema,
  execute: async (params) => {
    try {
      // Build request body, ensuring required fields are present
      const requestBody: any = {
        occupancies: params.occupancies,
        currency: params.currency,
        guestNationality: params.guestNationality,
        checkin: params.checkin,
        checkout: params.checkout
      }

      // Add location search method (at least one required)
      if (params.hotelIds && params.hotelIds.length > 0) {
        requestBody.hotelIds = params.hotelIds
      } else if (params.aiSearch) {
        requestBody.aiSearch = params.aiSearch
      } else if (params.placeId) {
        requestBody.placeId = params.placeId
      } else if (params.countryCode && params.cityName) {
        requestBody.countryCode = params.countryCode
        requestBody.cityName = params.cityName
      } else if (params.latitude && params.longitude) {
        requestBody.latitude = params.latitude
        requestBody.longitude = params.longitude
        if (params.radius) requestBody.radius = params.radius
      } else if (params.iataCode) {
        requestBody.iataCode = params.iataCode
      } else {
        return {
          error: 'At least one location search method is required (hotelIds, aiSearch, placeId, countryCode/cityName, latitude/longitude, or iataCode)'
        }
      }

      // Add optional parameters
      if (params.timeout !== undefined) requestBody.timeout = params.timeout
      if (params.maxRatesPerHotel !== undefined) requestBody.maxRatesPerHotel = params.maxRatesPerHotel
      if (params.boardType) requestBody.boardType = params.boardType
      if (params.refundableRatesOnly !== undefined) requestBody.refundableRatesOnly = params.refundableRatesOnly
      if (params.sort) requestBody.sort = params.sort
      if (params.roomMapping !== undefined) requestBody.roomMapping = params.roomMapping
      if (params.hotelName) requestBody.hotelName = params.hotelName
      if (params.limit !== undefined) requestBody.limit = params.limit
      if (params.offset !== undefined) requestBody.offset = params.offset
      if (params.minReviewsCount !== undefined) requestBody.minReviewsCount = params.minReviewsCount
      if (params.minRating !== undefined) requestBody.minRating = params.minRating
      if (params.zip) requestBody.zip = params.zip
      if (params.starRating) requestBody.starRating = params.starRating
      if (params.hotelTypeIds) requestBody.hotelTypeIds = params.hotelTypeIds
      if (params.chainIds) requestBody.chainIds = params.chainIds
      if (params.facilities) requestBody.facilities = params.facilities
      if (params.strictFacilityFiltering !== undefined) requestBody.strictFacilityFiltering = params.strictFacilityFiltering
      if (params.stream !== undefined) requestBody.stream = params.stream
      if (params.advancedAccessibilityOnly !== undefined) requestBody.advancedAccessibilityOnly = params.advancedAccessibilityOnly
      if (params.feed) requestBody.feed = params.feed
      if (params.includeHotelData !== undefined) requestBody.includeHotelData = params.includeHotelData

      // Get base URL for server-side fetch (requires absolute URL)
      let baseUrl: string
      try {
        baseUrl = await getBaseUrlString()
      } catch (urlError: any) {
        console.warn('[hotelRatesSearch] Failed to get base URL from headers, using localhost:', urlError?.message)
        baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'
      }
      
      const apiUrl = `${baseUrl}/api/hotels/rates`
      
      console.log('[hotelRatesSearch] Request body:', JSON.stringify(requestBody, null, 2))
      console.log('[hotelRatesSearch] Fetching rates from:', apiUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
      
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store'
      })

      console.log('[hotelRatesSearch] Response status:', resp.status, resp.statusText)

      if (!resp.ok) {
        const errorText = await resp.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        console.error('[hotelRatesSearch] API error:', {
          status: resp.status,
          statusText: resp.statusText,
          error: errorData
        })
        return {
          error: errorData.error?.message || errorData.message || `Request failed with status ${resp.status}`,
          status: resp.status
        }
      }

      const json = await resp.json()
      console.log('[hotelRatesSearch] Response data:', {
        hasData: !!json?.data,
        dataType: Array.isArray(json?.data) ? 'array' : typeof json?.data,
        dataLength: Array.isArray(json?.data) ? json.data.length : 'N/A',
        hasError: !!json?.error
      })
      return json
    } catch (e: any) {
      console.error('[hotelRatesSearch] Exception caught:', {
        message: e?.message,
        stack: e?.stack,
        name: e?.name,
        error: e
      })
      return {
        error: e?.message || 'Failed to search hotel rates'
      }
    }
  }
})

