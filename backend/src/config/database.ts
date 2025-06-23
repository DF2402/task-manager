export interface DatabaseConfig {
  path: string;
  verbose: boolean;
  foreignKeys: boolean;
}

export const getDatabaseConfig = (env: string = 'development'): DatabaseConfig => {
  const configs: Record<string, DatabaseConfig> = {
    development: {
      path: 'dev.db',
      verbose: true,
      foreignKeys: true
    },
    testing: {
      path: 'test.db',
      verbose: false,
      foreignKeys: true
    },
    production: {
      path: 'prod.db', 
      verbose: false,
      foreignKeys: true
    }
  };
  
  return configs[env] || configs.development;
};
