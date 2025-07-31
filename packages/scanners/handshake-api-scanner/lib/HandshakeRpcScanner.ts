import { GeneralScanner, ScannerConfig } from '@rosen-bridge/scanner';
import { HandshakeTransaction } from './types';

export class HandshakeRpcScanner extends GeneralScanner<HandshakeTransaction> {
  constructor(config: ScannerConfig<HandshakeTransaction>) {
    super(
      'handshake',
      config.dataSource,
      config.initialHeight,
      config.network,
      config.blockRetrieveGap,
      config.logger,
      config.suffix
    );
  }
}
