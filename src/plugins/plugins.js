// plugin.js

import { getPluginNames, getPluginRoutes } from '@/extensions/loader';
import storageManager from '@/plugins/storage';
import debug from '@/plugins/Logger.js';

const storage = storageManager();

const fetchAndStorePluginNames = (pluginRoutes) => {
  const pluginNames = getPluginNames(pluginRoutes);
  const pluginNamesStorage = {
    data: pluginNames,
    timestamp: new Date().getTime(),
  };
  storage.set('plugins', pluginNamesStorage);
  return pluginNames;
};

const updateStoredPluginNamesIfNeeded = (pluginRoutes) => {
  const storedPluginNames = storage.get('plugins');
  if (storedPluginNames) {
    const { data, timestamp } = storedPluginNames;
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const now = new Date().getTime();
    if (now - timestamp >= oneHour) {
      const pluginNames = fetchAndStorePluginNames(pluginRoutes);
      debug.log("Updated plugin names:", pluginNames);
    }
  } else {
    const pluginNames = fetchAndStorePluginNames(pluginRoutes);
    debug.log("Stored initial plugin names:", pluginNames);
  }
};

export { fetchAndStorePluginNames, updateStoredPluginNamesIfNeeded };
