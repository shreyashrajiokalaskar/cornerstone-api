export enum AuthProvider {
  EXTERNAL = 'EXTERNAL',
  INTERNAL = 'INTERNAL',
}

export enum ROLES {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum AllowedMimeTypes {
  PDF = 'application/pdf',
  TEXT = 'text/plain',
  MARKDOWN = 'text/markdown',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export enum DOC_STATUS {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
