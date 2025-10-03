import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockEntity, ExtractorStatusEntity, migrations } from '@rosen-bridge/scanner';

const getDataSource = (): DataSource => {
  try {
    return new DataSource({
      type: 'sqlite',
      database: 'handshake-test.sqlite',
      synchronize: false,
      logging: false,
      entities: [
        BlockEntity,
        ExtractorStatusEntity,
      ],
      migrations: [
        ...migrations.sqlite,
      ],
    });
  } catch (error) {
    console.error('Error creating DataSource:', error);
    throw error;
  }
};

const dataSource = getDataSource();

export default dataSource;
