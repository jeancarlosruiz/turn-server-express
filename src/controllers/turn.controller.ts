import { Request, Response } from 'express';
import { getTurnAuthService } from '../utils/turnAuth';

/**
 * Get TURN server credentials
 */
export const getTurnCredentials = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get TTL from query parameter or use default (24 hours)
    const ttl = req.query.ttl ? parseInt(req.query.ttl as string, 10) : 86400;

    // Validate TTL
    if (isNaN(ttl) || ttl < 60 || ttl > 86400) {
      res.status(400).json({
        error: 'Invalid TTL',
        message: 'TTL must be between 60 and 86400 seconds',
      });
      return;
    }

    // Generate credentials
    const turnAuthService = getTurnAuthService();
    const credentials = turnAuthService.generateCredentials(ttl);

    res.status(200).json({
      success: true,
      credentials: {
        username: credentials.username,
        credential: credentials.password,
        ttl: credentials.ttl,
        urls: credentials.uris,
      },
    });
  } catch (error) {
    console.error('Error generating TURN credentials:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate TURN credentials',
    });
  }
};

/**
 * Get TURN server configuration info
 */
export const getTurnConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = {
      realm: process.env.TURN_REALM || 'turn.example.com',
      port: parseInt(process.env.TURN_PORT || '3478', 10),
      tlsPort: parseInt(process.env.TURN_TLS_PORT || '5349', 10),
      externalIp: process.env.EXTERNAL_IP || 'auto-detect',
    };

    res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('Error getting TURN config:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get TURN configuration',
    });
  }
};
