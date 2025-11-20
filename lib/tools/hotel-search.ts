import { tool } from 'ai'

import { hotelSearchSchema } from '@/lib/schema/hotel-search'
import { decodeIntentFromText } from '@/lib/utils/intent'
import { getBaseUrlString } from '@/lib/utils/url'

export const hotelSearchTool = tool({
  description:
    'Hotel search intent resolver. Given a user query, returns place candidates and normalized dates/occupancy.',
  parameters: hotelSearchSchema,
  execute: async ({ textQuery, type = 'hotel', language = 'en', checkin, checkout, adults, children }) => {
    // Fill missing fields from quick intent decoding
    const decoded = decodeIntentFromText(textQuery)
    const q = decoded.textQuery || textQuery
    const ci = checkin || decoded.checkin
    const co = checkout || decoded.checkout
    const ad = adults ?? decoded.adults
    const ch = children ?? decoded.children

    try {
      const params = new URLSearchParams({
        textQuery: q,
        language
      })
      if (type) params.set('type', type)

      // Get base URL for server-side fetch (requires absolute URL)
      let baseUrl: string
      try {
        baseUrl = await getBaseUrlString()
      } catch (urlError: any) {
        console.warn('[hotelSearch] Failed to get base URL from headers, using localhost:', urlError?.message)
        baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000'
      }
      
      const apiUrl = `${baseUrl}/api/hotels/places?${params.toString()}`
      
      console.log('[hotelSearch] Fetching places for query:', q)
      console.log('[hotelSearch] API URL:', apiUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')) // Mask any credentials
      const resp = await fetch(apiUrl, {
        cache: 'no-store'
      })

      console.log('[hotelSearch] Response status:', resp.status, resp.statusText)

      if (!resp.ok) {
        const errorText = await resp.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        console.error('[hotelSearch] API error:', {
          status: resp.status,
          statusText: resp.statusText,
          error: errorData
        })
        return {
          query: q,
          checkin: ci || null,
          checkout: co || null,
          adults: ad ?? null,
          children: ch ?? null,
          places: [],
          error: errorData.error || errorData.message || `API returned ${resp.status}: ${resp.statusText}`
        }
      }

      const json = await resp.json()
      console.log('[hotelSearch] Response data:', {
        hasData: !!json?.data,
        dataType: Array.isArray(json?.data) ? 'array' : typeof json?.data,
        dataLength: Array.isArray(json?.data) ? json.data.length : 'N/A',
        fullResponse: json
      })

      const places = Array.isArray(json?.data) ? json.data : []

      if (places.length === 0) {
        console.warn('[hotelSearch] No places found for query:', q)
      }

      return {
        query: q,
        checkin: ci || null,
        checkout: co || null,
        adults: ad ?? null,
        children: ch ?? null,
        places
      }
    } catch (e: any) {
      console.error('[hotelSearch] Exception caught:', {
        message: e?.message,
        stack: e?.stack,
        name: e?.name,
        error: e
      })
      return {
        query: q,
        checkin: ci || null,
        checkout: co || null,
        adults: ad ?? null,
        children: ch ?? null,
        places: [],
        error: e?.message || 'Failed to resolve hotel places'
      }
    }
  }
})


