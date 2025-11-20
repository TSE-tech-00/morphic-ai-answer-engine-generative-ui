'use client'

import type { ToolInvocation } from 'ai'

import { HotelRatesContent } from '@/components/artifact/hotel-rates-content'
import { RetrieveArtifactContent } from '@/components/artifact/retrieve-artifact-content'

export function ToolInvocationContent({
  toolInvocation
}: {
  toolInvocation: ToolInvocation
}) {
  switch (toolInvocation.toolName) {
    case 'hotel_search':
      return (
        <div className="p-4 text-sm text-muted-foreground">
          Hotel destination resolved. Continue the conversation for recommendations.
        </div>
      )
    case 'hotel_rates_search':
      return <HotelRatesContent tool={toolInvocation} />
    case 'retrieve':
      return <RetrieveArtifactContent tool={toolInvocation} />
    default:
      return <div className="p-4">Details for this tool are not available</div>
  }
}
