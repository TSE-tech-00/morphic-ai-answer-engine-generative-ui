import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

const exampleMessages = [
  {
    heading: 'Find a hotel in Tokyo for next weekend',
    message: 'Can you help me find and book a hotel in Tokyo for next weekend?'
  },
  {
    heading: 'Compare hotel prices in New York City',
    message: 'Show me the best hotel options in New York City for a business trip, and compare their prices and amenities.'
  },
  {
    heading: 'Locate family-friendly hotels near Disneyland Paris',
    message: 'Can you recommend some family-friendly hotels near Disneyland Paris and help with booking?'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
