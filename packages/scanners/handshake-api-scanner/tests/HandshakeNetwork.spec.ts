import { expect } from 'chai';
import sinon from 'sinon';
import axios from '@rosen-bridge/rate-limited-axios';
import { HandshakeNetwork } from '../lib/HandshakeNetwork';
import { Block } from '@rosen-bridge/scanner-interfaces';

describe('HandshakeNetwork', () => {
  let network: HandshakeNetwork;
  let axiosStub: sinon.SinonStub;
  const url = 'http://localhost:12037';
  const timeout = 5000;
  const apiKey = 'test-api-key';
  
  beforeEach(() => {
    axiosStub = sinon.stub(axios, 'create');
    axiosStub.returns({
      post: sinon.stub().resolves({ data: { result: {} } })
    });
    network = new HandshakeNetwork(url, timeout, apiKey);
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  it('should initialize with correct parameters', () => {
    expect(axiosStub.calledOnce).to.be.true;
    const axiosConfig = axiosStub.firstCall.args[0];
    expect(axiosConfig.baseURL).to.equal(url);
    expect(axiosConfig.timeout).to.equal(timeout);
    expect(axiosConfig.auth).to.deep.equal({ username: 'x', password: apiKey });
  });
  
  describe('getBlockAtHeight', () => {
    it('should return block information for a given height', async () => {
      const mockBlockHash = '000000000000006c803a6f56aa3c5c56585d2bf75f195594e5ae3f10d3c55446';
      const mockBlock = {
        hash: mockBlockHash,
        height: 100,
        time: 1581082624,
        previousblockhash: '000000000000006d803a6f56aa3c5c56585d2bf75f195594e5ae3f10d3c55447',
        tx: ['tx1', 'tx2']
      };
      
      const postStub = (network as any).client.post;
      postStub.onFirstCall().resolves({ data: { result: mockBlockHash } });
      postStub.onSecondCall().resolves({ data: { result: mockBlock } });
      
      const block: Block = await network.getBlockAtHeight(100);
      
      expect(block.hash).to.equal(mockBlockHash);
      expect(block.height).to.equal(100);
      expect(block.timestamp).to.equal(1581082624);
      expect(block.parentHash).to.equal('000000000000006d803a6f56aa3c5c56585d2bf75f195594e5ae3f10d3c55447');
      expect(block.txCount).to.equal(2);
      
      expect(postStub.calledTwice).to.be.true;
      expect(postStub.firstCall.args[1].method).to.equal('getblockhash');
      expect(postStub.secondCall.args[1].method).to.equal('getblock');
    });
  });
  
  describe('getCurrentHeight', () => {
    it('should return the current blockchain height', async () => {
      const mockHeight = 123456;
      const postStub = (network as any).client.post;
      postStub.resolves({ data: { result: { blocks: mockHeight } } });
      
      const height = await network.getCurrentHeight();
      
      expect(height).to.equal(mockHeight);
      expect(postStub.calledOnce).to.be.true;
      expect(postStub.firstCall.args[1].method).to.equal('getblockchaininfo');
    });
  });
  
  describe('getBlockTxs', () => {
    it('should return transactions for a given block hash', async () => {
      const mockBlockHash = '000000000000006c803a6f56aa3c5c56585d2bf75f195594e5ae3f10d3c55446';
      const mockBlock = {
        hash: mockBlockHash,
        height: 100,
        time: 1581082624,
        previousblockhash: '000000000000006d803a6f56aa3c5c56585d2bf75f195594e5ae3f10d3c55447',
        tx: ['tx1', 'tx2']
      };
      
      const mockTx1 = {
        txid: 'tx1',
        hash: 'hash1',
        blockhash: mockBlockHash,
        // Other tx properties...
      };
      
      const mockTx2 = {
        txid: 'tx2',
        hash: 'hash2',
        blockhash: mockBlockHash,
        // Other tx properties...
      };
      
      const postStub = (network as any).client.post;
      postStub.onFirstCall().resolves({ data: { result: mockBlock } });
      postStub.onSecondCall().resolves({ data: { result: mockTx1 } });
      postStub.onThirdCall().resolves({ data: { result: mockTx2 } });
      
      const txs = await network.getBlockTxs(mockBlockHash);
      
      expect(txs.length).to.equal(2);
      expect(txs[0].txid).to.equal('tx1');
      expect(txs[1].txid).to.equal('tx2');
      
      expect(postStub.calledThrice).to.be.true;
      expect(postStub.firstCall.args[1].method).to.equal('getblock');
      expect(postStub.secondCall.args[1].method).to.equal('getrawtransaction');
      expect(postStub.secondCall.args[1].params).to.deep.equal(['tx1', true, mockBlockHash]);
      expect(postStub.thirdCall.args[1].method).to.equal('getrawtransaction');
      expect(postStub.thirdCall.args[1].params).to.deep.equal(['tx2', true, mockBlockHash]);
    });
  });
  
  describe('error handling', () => {
    it('should throw error when RPC call returns an error', async () => {
      const postStub = (network as any).client.post;
      postStub.resolves({ data: { error: { code: -32601, message: 'Method not found' } } });
      
      try {
        await network.getCurrentHeight();
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).to.include('RPC Error');
        expect(error.message).to.include('-32601');
        expect(error.message).to.include('Method not found');
      }
    });
  });
});
