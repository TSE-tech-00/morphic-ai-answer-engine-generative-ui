import { NextRequest } from 'next/server'

const LITEAPI_BASE = 'https://api.liteapi.travel/v3.0'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const apiKey = process.env.LITEAPI_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'LITEAPI_API_KEY is not configured' }),
        { status: 500 }
      )
    }

    const resp = await fetch(`${LITEAPI_BASE}/hotels/rates`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    const text = await resp.text()
    return new Response(text, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Unknown error' }),
      { status: 500 }
    )
  }
}

