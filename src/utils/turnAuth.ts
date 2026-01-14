import crypto from 'crypto';
import { TurnCredentials, TurnConfig } from '../types/turn.types';

/**
 * Generates time-limited credentials for TURN server
 * Uses HMAC-SHA1 authentication compatible with coturn
 */
export class TurnAuthService {
  private config: TurnConfig;

  constructor(config: TurnConfig) {
    this.config = config;
  }

  /**
   * Generate temporary TURN credentials
   * @param ttl Time to live in seconds (default: 24 hours)
   * @returns TurnCredentials object
   */
  generateCredentials(ttl: number = 86400): TurnCredentials {
    const timestamp = Math.floor(Date.now() / 1000) + ttl;
    const username = `${timestamp}:turnuser`;
    
    // Generate password using HMAC-SHA1
    const hmac = crypto.createHmac('sha1', this.config.staticAuthSecret);
    hmac.update(username);
    const password = hmac.digest('base64');

    // Get external IP or use realm
    const host = this.config.externalIp || this.config.realm;

    // Generate URIs for TURN server
    const uris = [
      `turn:${host}:${this.config.port}?transport=udp`,
      `turn:${host}:${this.config.port}?transport=tcp`,
      `turns:${host}:${this.config.tlsPort}?transport=tcp`,
    ];

    return {
      username,
      password,
      ttl,
      uris,
    };
  }

  /**
   * Validate if credentials are still valid
   * @param username Username to validate
   * @returns boolean indicating if credentials are valid
   */
  validateCredentials(username: string): boolean {
    const parts = username.split(':');
    if (parts.length !== 2) {
      return false;
    }

    const timestamp = parseInt(parts[0], 10);
    const currentTime = Math.floor(Date.now() / 1000);

    return timestamp > currentTime;
  }
}

/**
 * Get TURN auth service instance
 */
export function getTurnAuthService(): TurnAuthService {
  const config: TurnConfig = {
    staticAuthSecret: process.env.TURN_STATIC_AUTH_SECRET || 'default-secret-change-this',
    realm: process.env.TURN_REALM || 'turn.example.com',
    port: parseInt(process.env.TURN_PORT || '3478', 10),
    tlsPort: parseInt(process.env.TURN_TLS_PORT || '5349', 10),
    externalIp: process.env.EXTERNAL_IP,
  };

  return new TurnAuthService(config);
}
