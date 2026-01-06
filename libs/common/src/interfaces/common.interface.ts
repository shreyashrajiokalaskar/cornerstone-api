export interface IGoogleAuthCredentials {
  web: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    javascript_origins: string[];
  };
}

export interface ICurrentUser {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export interface IPresignedUrl {
  url: string;
  key: string;
}

export interface IDocumentJob {
  documentId: string;
  key: string;
  workspaceId: string;
}

export interface ISimilarSearch {
  id: string;
  content: string;
  document_name: string;
  document_id: string;
  similarity: any;
}
