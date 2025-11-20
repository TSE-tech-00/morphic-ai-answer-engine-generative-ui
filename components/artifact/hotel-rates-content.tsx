'use client'

import type { ToolInvocation } from 'ai'
import Image from 'next/image'

import { Section, ToolArgsSection } from '@/components/section'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface HotelRate {
  rateId: string
  occupancyNumber: number
  name: string
  maxOccupancy: number
  adultCount: number
  childCount: number
  boardType: string
  boardName: string
  remarks: string
  priceType: string
  commission?: Array<{ amount: number; currency: string }>
  retailRate: {
    total: Array<{ amount: number; currency: string }>
    suggestedSellingPrice?: Array<{ amount: number; currency: string; source?: string }>
    initialPrice?: Array<{ amount: number; currency: string }>
    taxesAndFees?: Array<{
      included: boolean
      description: string
      amount: number
      currency: string
    }>
  }
  cancellationPolicies?: {
    cancelPolicyInfos?: Array<{
      cancelTime: string
      amount: number
      currency: string
      type: string
      timezone: string
    }>
    refundableTag?: string
  }
  paymentTypes?: string[]
  perks?: Array<{
    perkId: number
    name: string
    amount?: number
    currency?: string
    level?: string
  }>
}

interface RoomType {
  roomTypeId: string
  name: string
  offerId: string
  supplier: string
  supplierId: number
  rates: HotelRate[]
  offerRetailRate?: { amount: number; currency: string } | Array<{ amount: number; currency: string }>
  suggestedSellingPrice?: { amount: number; currency: string; source?: string } | Array<{ amount: number; currency: string; source?: string }>
  offerInitialPrice?: { amount: number; currency: string } | Array<{ amount: number; currency: string }>
  priceType: string
  rateType: string
}

interface HotelData {
  hotelId: string
  name?: string
  main_photo?: string
  address?: string
  rating?: number
  roomTypes: RoomType[]
}

interface HotelRatesResponse {
  data?: HotelData[]
  error?: {
    code?: number
    message?: string
    description?: string
  }
  guestLevel?: number
  sandbox?: boolean
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount)
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

export function HotelRatesContent({ tool }: { tool: ToolInvocation }) {
  const result: HotelRatesResponse | undefined =
    tool.state === 'result' ? tool.result : undefined

  if (!result) {
    return <div className="p-4">Loading hotel rates...</div>
  }

  if (result.error) {
    return (
      <div className="p-4 text-destructive">
        <p className="font-semibold">Error: {result.error.code || 'Unknown'}</p>
        <p className="text-sm">{result.error.message || result.error.description || 'Failed to fetch hotel rates'}</p>
      </div>
    )
  }

  if (!result.data || result.data.length === 0) {
    return <div className="p-4">No hotel rates found</div>
  }

  const hotels = result.data

  return (
    <div className="space-y-4">
      <ToolArgsSection tool="hotel_rates_search">
        {tool.args?.aiSearch || tool.args?.cityName || tool.args?.hotelIds?.[0] || 'Hotel search'}
      </ToolArgsSection>

      <Section title={`Found ${hotels.length} hotel${hotels.length !== 1 ? 's' : ''}`}>
        <div className="space-y-6">
          {hotels.map((hotel) => {
            const cheapestRate = hotel.roomTypes
              .flatMap((rt) => rt.rates)
              .sort((a, b) => {
                const priceA = a.retailRate.total[0]?.amount || Infinity
                const priceB = b.retailRate.total[0]?.amount || Infinity
                return priceA - priceB
              })[0]

            const cheapestPrice = cheapestRate?.retailRate.total[0]
            const hasHotelData = hotel.name || hotel.main_photo || hotel.address

            return (
              <Card key={hotel.hotelId} className="overflow-hidden">
                {hasHotelData && (
                  <CardHeader>
                    <div className="flex gap-4">
                      {hotel.main_photo && (
                        <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={hotel.main_photo}
                            alt={hotel.name || 'Hotel'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">
                          {hotel.name || `Hotel ${hotel.hotelId}`}
                        </CardTitle>
                        {hotel.address && (
                          <CardDescription className="mt-1 line-clamp-1">
                            {hotel.address}
                          </CardDescription>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          {hotel.rating !== undefined && hotel.rating > 0 && (
                            <Badge variant="secondary">
                              ⭐ {hotel.rating.toFixed(1)}
                            </Badge>
                          )}
                          {cheapestPrice && (
                            <Badge variant="default" className="ml-auto">
                              From {formatPrice(cheapestPrice.amount, cheapestPrice.currency)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                )}
                <CardContent className={hasHotelData ? '' : 'pt-6'}>
                  {!hasHotelData && cheapestPrice && (
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Hotel {hotel.hotelId}</h3>
                      </div>
                      <Badge variant="default">
                        From {formatPrice(cheapestPrice.amount, cheapestPrice.currency)}
                      </Badge>
                    </div>
                  )}
                  <div className="space-y-4">
                    {hotel.roomTypes.map((roomType, idx) => {
                      const offerPrice = Array.isArray(roomType.offerRetailRate)
                        ? roomType.offerRetailRate[0]
                        : roomType.offerRetailRate

                      return (
                        <div
                          key={roomType.roomTypeId || idx}
                          className="border-t pt-4 first:border-t-0 first:pt-0"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1">{roomType.name}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {roomType.rateType && (
                                  <Badge variant="outline" className="text-xs">
                                    {roomType.rateType}
                                  </Badge>
                                )}
                                {roomType.rates[0]?.boardName && (
                                  <Badge variant="outline" className="text-xs">
                                    {roomType.rates[0].boardName}
                                  </Badge>
                                )}
                                {roomType.rates[0]?.cancellationPolicies?.refundableTag === 'RFN' && (
                                  <Badge variant="outline" className="text-xs text-green-600">
                                    Refundable
                                  </Badge>
                                )}
                              </div>
                              {roomType.rates[0]?.remarks && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                  {roomType.rates[0].remarks.replace(/<[^>]*>/g, '')}
                                </p>
                              )}
                            </div>
                            {offerPrice && (
                              <div className="flex-shrink-0 text-right">
                                <div className="text-lg font-semibold">
                                  {formatPrice(offerPrice.amount, offerPrice.currency)}
                                </div>
                                {roomType.rates.length > 1 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {roomType.rates.length} rate{roomType.rates.length !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {roomType.rates.length > 1 && (
                            <div className="mt-3 space-y-2">
                              {roomType.rates.slice(0, 3).map((rate, rateIdx) => {
                                const price = rate.retailRate.total[0]
                                if (!price) return null
                                return (
                                  <div
                                    key={rate.rateId || rateIdx}
                                    className="flex items-center justify-between text-sm py-1 px-2 bg-muted/50 rounded"
                                  >
                                    <span className="text-muted-foreground">
                                      {rate.name || `Rate ${rateIdx + 1}`}
                                    </span>
                                    <span className="font-medium">
                                      {formatPrice(price.amount, price.currency)}
                                    </span>
                                  </div>
                                )
                              })}
                              {roomType.rates.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center py-1">
                                  +{roomType.rates.length - 3} more rate{roomType.rates.length - 3 !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

