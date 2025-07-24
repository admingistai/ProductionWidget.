/**
 * Generate a unique message ID
 * @returns Unique ID string
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}