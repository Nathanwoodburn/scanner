import { HandshakeBlock, HandshakeTransaction, HandshakeTxInput, HandshakeTxOutput } from '../lib/types';

/**
 * Creates a mock Handshake block for testing
 * @param height - Block height
 * @param txCount - Number of transactions to include
 * @returns Mock block
 */
export const createMockBlock = (height: number, txCount = 1): HandshakeBlock => {
  const txIds = Array(txCount).fill(0).map((_, i) => `tx${i + 1}`);
  
  return {
    hash: `000000000000000000000000000000000000000000000000000000000000${height.toString(16).padStart(4, '0')}`,
    previousblockhash: `000000000000000000000000000000000000000000000000000000000000${(height - 1).toString(16).padStart(4, '0')}`,
    height,
    time: Math.floor(Date.now() / 1000) - (1000 - height) * 600,
    tx: txIds
  };
};

/**
 * Creates a mock Handshake transaction for testing
 * @param txid - Transaction ID
 * @param blockHash - Block hash
 * @returns Mock transaction
 */
export const createMockTransaction = (txid: string, blockHash: string): HandshakeTransaction => {
  const input: HandshakeTxInput = {
    coinbase: txid.startsWith('coinbase'),
    txid: '0000000000000000000000000000000000000000000000000000000000000000',
    vout: 4294967295,
    sequence: 0
  };
  
  const output: HandshakeTxOutput = {
    value: 2000,
    n: 0,
    address: {
      version: 0,
      hash: '7cd558a7f136bffb3cc21c313612dc1d61cd6e73',
      string: 'hs1q0n243fl3x6llk0xzrscnvykur4su6mnn6wk0w5'
    },
    covenant: {
      type: 0,
      action: 'NONE',
      items: []
    }
  };
  
  return {
    txid,
    hash: `hash_${txid}`,
    size: 114,
    vsize: 90,
    version: 0,
    locktime: 1000,
    vin: [input],
    vout: [output],
    blockhash: blockHash,
    confirmations: 100,
    time: Math.floor(Date.now() / 1000) - 3600,
    blocktime: Math.floor(Date.now() / 1000) - 3600,
    hex: '00000000010000000000000000000000000000000000000000000000000000000000000000ffffffff'
  };
};
