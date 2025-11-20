'use client'

import { ExternalLink } from 'lucide-react'

import { SearchResultItem } from '@/lib/types'


interface SearchResultsProps {
  results: SearchResultItem[]
  displayMode?: 'list' | 'grid'
}

export function SearchResults({ results, displayMode = 'list' }: SearchResultsProps) {
  if (!results || results.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No results found</div>
  }

  if (displayMode === 'list') {
    return (
      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={result.url || index}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-2 mb-2">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm hover:underline flex items-center gap-1 flex-1"
              >
                {result.title || 'Untitled'}
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            </div>
            {result.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground break-all block mb-2"
              >
                {result.url}
              </a>
            )}
            {result.content && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {result.content}
              </p>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Grid mode (if needed in the future)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {results.map((result, index) => (
        <div
          key={result.url || index}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm hover:underline flex items-center gap-1 mb-2"
          >
            {result.title || 'Untitled'}
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
          {result.content && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
              {result.content}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

