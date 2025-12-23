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
