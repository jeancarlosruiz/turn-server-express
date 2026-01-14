import { Router } from 'express';
import { getTurnCredentials, getTurnConfig } from '../controllers/turn.controller';

const router = Router();

/**
 * @route   GET /api/turn/credentials
 * @desc    Get TURN server credentials
 * @query   ttl - Time to live in seconds (optional, default: 86400)
 * @access  Public
 */
router.get('/credentials', getTurnCredentials);

/**
 * @route   GET /api/turn/config
 * @desc    Get TURN server configuration
 * @access  Public
 */
router.get('/config', getTurnConfig);

export default router;
