import axios, { Axios } from '@rosen-bridge/rate-limited-axios';
import {
  AbstractNetworkConnector,
  Block,
} from '@rosen-bridge/scanner-interfaces';
import { HandshakeBlock, HandshakeTransaction } from './types';

export class HandshakeNetwork extends AbstractNetworkConnector<HandshakeTransaction> {
  private readonly url: string;
  private readonly timeout: number;
  private readonly apiKey?: string;
  private readonly apiId?: string;
  private client: Axios;
  private requestId = 0;

  constructor(url: string, timeout: number, apiKey?: string, apiId?: string) {
    super();
    this.url = url;
    this.timeout = timeout;
    this.apiKey = apiKey;
    this.apiId = apiId;

    this.client = axios.create({
      baseURL: this.url,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      // Use basic authentication with 'x' as username and apiKey as password
      ...(this.apiKey && { auth: { username: 'x', password: this.apiKey } }),
    });
  }

  /**
   * Makes a JSON-RPC call to the Handshake node
   * @param method - RPC method name
   * @param params - RPC method parameters
   * @returns The result of the RPC call
   */
  private async rpcCall<T>(method: string, params: any[]): Promise<T> {
    const response = await this.client.post('', {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params,
    });

    if (response.data.error) {
      throw new Error(
        `RPC Error: ${response.data.error.code} - ${response.data.error.message}`
      );
    }

    return response.data.result;
  }

  /**
   * Returns block at height
   * @param height - Block height
   * @returns Block details
   */
  getBlockAtHeight = async (height: number): Promise<Block> => {
    // Get block hash at height
    const blockHash = await this.rpcCall<string>('getblockhash', [height]);

    // Get block details using hash
    const block = await this.rpcCall<HandshakeBlock>('getblock', [
      blockHash,
      true,
    ]);

    return {
      hash: block.hash,
      parentHash: block.previousblockhash,
      height: block.height,
      timestamp: block.time,
      txCount: block.tx.length,
    };
  }

  /**
   * Returns current network height
   * @returns current height
   */
  getCurrentHeight = async (): Promise<number> => {
    const blockchainInfo = await this.rpcCall<{ blocks: number }>(
      'getblockchaininfo',
      []
    );
    return blockchainInfo.blocks;
  }

  /**
   * Return transactions in a block with specified hash
   * @param blockHash - Block hash
   * @returns Array of transactions in the block
   */
  getBlockTxs = async (blockHash: string): Promise<Array<HandshakeTransaction>> => {
    // First get the block to get tx ids
    const block = await this.rpcCall<HandshakeBlock>('getblock', [
      blockHash,
      true,
    ]);

    // Get detailed transaction information for each tx id
    const transactions: HandshakeTransaction[] = [];
    for (const txid of block.tx) {
      const tx = await this.rpcCall<HandshakeTransaction>('getrawtransaction', [
        txid,
        true,
        blockHash // Include blockHash parameter to help locate the transaction
      ]);
      transactions.push(tx);
    }

    return transactions;
  }
}
