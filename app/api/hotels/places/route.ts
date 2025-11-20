import { NextRequest } from 'next/server'

const LITEAPI_BASE = 'https://api.liteapi.travel/v3.0'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const textQuery = searchParams.get('textQuery')
    const type = searchParams.get('type') || undefined
    const language = searchParams.get('language') || 'en'
    const clientIP = searchParams.get('clientIP') || undefined

    console.log('[hotels/places] Request params:', { textQuery, type, language, clientIP })

    if (!textQuery) {
      console.error('[hotels/places] Missing textQuery parameter')
      return new Response(JSON.stringify({ error: 'textQuery is required' }), {
        status: 400
      })
    }

    const apiKey = process.env.LITEAPI_API_KEY
    if (!apiKey) {
      console.error('[hotels/places] LITEAPI_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'LITEAPI_API_KEY is not configured' }),
        { status: 500 }
      )
    }

    const qs = new URLSearchParams()
    qs.set('textQuery', textQuery)
    if (type) qs.set('type', type)
    if (language) qs.set('language', language)
    if (clientIP) qs.set('clientIP', clientIP)

    const url = `${LITEAPI_BASE}/data/places?${qs.toString()}`
    console.log('[hotels/places] Fetching from LiteAPI:', url.replace(apiKey, '***'))

    const resp = await fetch(url, {
      headers: {
        'X-API-Key': apiKey
      },
      cache: 'no-store'
    })

    console.log('[hotels/places] LiteAPI response status:', resp.status, resp.statusText)

    const text = await resp.text()
    
    if (!resp.ok) {
      console.error('[hotels/places] LiteAPI error response:', {
        status: resp.status,
        statusText: resp.statusText,
        body: text.substring(0, 500) // First 500 chars
      })
    } else {
      try {
        const json = JSON.parse(text)
        console.log('[hotels/places] LiteAPI success:', {
          hasData: !!json?.data,
          dataType: Array.isArray(json?.data) ? 'array' : typeof json?.data,
          dataLength: Array.isArray(json?.data) ? json.data.length : 'N/A',
          hasError: !!json?.error
        })
      } catch {
        console.log('[hotels/places] Response is not JSON')
      }
    }

    return new Response(text, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error('[hotels/places] Exception caught:', {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      error: err
    })
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Unknown error' }),
      { status: 500 }
    )
  }
}


