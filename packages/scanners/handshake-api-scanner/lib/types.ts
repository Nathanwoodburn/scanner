export interface HandshakeBlock {
  hash: string;
  height: number;
  time: number;
  previousblockhash: string;
  tx: string[];
}

export interface HandshakeTransaction {
  txid: string;
  hash: string;
  size: number;
  vsize: number;
  version: number;
  locktime: number;
  vin: HandshakeTxInput[];
  vout: HandshakeTxOutput[];
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
  hex: string;
}

export interface HandshakeTxInput {
  coinbase?: boolean;
  txid: string;
  vout: number;
  txinwitness?: string[];
  sequence: number;
}

export interface HandshakeTxOutput {
  value: number;
  n: number;
  address?: {
    version: number;
    hash: string;
    string: string;
  };
  covenant: {
    type: number;
    action: string;
    items: string[];
  };
}