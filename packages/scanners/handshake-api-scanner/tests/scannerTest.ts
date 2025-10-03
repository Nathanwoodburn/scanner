import { HandshakeRpcScanner } from '../lib/HandshakeRpcScanner.js';
import { HandshakeNetwork } from '../lib/HandshakeNetwork.js';
import { BlockEntity } from '@rosen-bridge/scanner';
import dataSource from './dataSource.js';

/**
 * A simple test script to verify that the HandshakeRpcScanner works correctly.
 * This test:
 * 1. Initializes a database connection
 * 2. Sets up the Handshake scanner with a network connection
 * 3. Updates the scanner to fetch recent blocks
 * 
 * Usage: 
 * - Adjust the HSD_API_URL and HSD_API_KEY to match your Handshake node configuration
 * - Set INITIAL_HEIGHT to a valid block height in your Handshake blockchain
 * - Run with:
 *   npx tsx tests/scannerTest.ts
 */

// Configuration
const HSD_API_URL = process.env.HSD_API_URL || 'http://127.0.0.1:12037';
const HSD_API_KEY = process.env.HSD_API_KEY || 'api-key';
const INITIAL_HEIGHT = parseInt(process.env.INITIAL_HEIGHT || '500000');
const TIMEOUT = parseInt(process.env.TIMEOUT || '30000');

// Simple logger for the test
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`);
    if (error) console.error(error);
  },
  debug: (message: string) => console.debug(`[DEBUG] ${message}`),
};

async function runTest() {
  try {
    // Initialize database
    logger.info('Initializing database...');
    await dataSource.initialize();
    await dataSource.runMigrations();
    logger.info('Database migrations completed successfully');

    // Create network connector
    logger.info(`Connecting to Handshake node at ${HSD_API_URL}`);
    const network = new HandshakeNetwork(HSD_API_URL, TIMEOUT, HSD_API_KEY);

    // Configure and create scanner
    const scannerConfig = {
      dataSource: dataSource,
      initialHeight: INITIAL_HEIGHT,
      network: network,
      logger: logger,
    };

    logger.info(`Creating scanner starting at block height ${INITIAL_HEIGHT}`);
    const scanner = new HandshakeRpcScanner(scannerConfig);
    
    // Start scanner update process
    logger.info('Starting scanner update...');
    await scanner.update();
    logger.info('Scanner update completed');

    // Get current height from the database to verify it worked
    const blockRepo = dataSource.getRepository(BlockEntity);
    const latestBlock = await blockRepo.findOne({
      where: { chain: 'handshake' },
      order: { height: 'DESC' }
    });

    if (latestBlock) {
      logger.info(`Latest block in database: ${latestBlock.height} (${latestBlock.hash})`);
    } else {
      logger.warn('No blocks found in database');
    }

  } catch (error) {
    logger.error('Error running scanner test:', error);
  } finally {
    // Close database connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      logger.info('Database connection closed');
    }
  }
}

// Run the test
runTest().catch(error => {
  console.error('Unhandled error in test:', error);
  process.exit(1);
});
