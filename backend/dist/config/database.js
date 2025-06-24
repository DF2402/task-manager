"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (env = 'development') => {
    const configs = {
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
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.js.map