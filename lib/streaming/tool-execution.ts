import {
  CoreMessage,
  DataStreamWriter
} from 'ai'

import { ExtendedCoreMessage } from '../types'

interface ToolExecutionResult {
  toolCallDataAnnotation: ExtendedCoreMessage | null
  toolCallMessages: CoreMessage[]
}

export async function executeToolCall(
  coreMessages: CoreMessage[],
  dataStream: DataStreamWriter,
  model: string,
  searchMode: boolean
): Promise<ToolExecutionResult> {
  // Search tool has been removed - return empty tool call
  // This function is kept for backward compatibility but no longer executes any tools
  return { toolCallDataAnnotation: null, toolCallMessages: [] }
}
