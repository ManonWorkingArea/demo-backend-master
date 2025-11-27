import { default as storageManager } from '@/plugins/storage';
export { default as storage } from '@/plugins/storage';
export { key } from '@/master/host.js';
export { default as client } from '@/plugins/requestClient';
export { log } from '@/plugins/Logger.js';

// Get configs from storageManager
const configs = storageManager.get('configs');
const session = storageManager.get('session');
export { configs, session };