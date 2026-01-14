export interface TurnCredentials {
  username: string;
  password: string;
  ttl: number;
  uris: string[];
}

export interface TurnConfig {
  staticAuthSecret: string;
  realm: string;
  port: number;
  tlsPort: number;
  externalIp?: string;
}
