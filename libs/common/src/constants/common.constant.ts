export enum CHAT_ROLES {
  user = 'user',
  assistant = 'assistant',
}

export const AI_LIMITS = {
  MAX_TOKENS_PER_REQUEST: 3_000,
  MAX_CHUNKS_PER_QUERY: 8,
  MAX_CONTEXT_TOKENS: 6_000,
  MAX_MESSAGE_LENGTH: 4_000,
};
