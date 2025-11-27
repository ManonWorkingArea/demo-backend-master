export default function cache() {
    const cache = new Map();
  
    function handle(type, key, value) {
      if (type === 'set') {
        cache.set(key, value);
      } else if (type === 'get') {
        return cache.get(key);
      } else if (type === 'remove') {
        cache.delete(key);
      } else if (type === 'clear') {
        cache.clear();
      } else if (type === 'getAll') {
        return [...cache];
      } else if (type === 'has') {
        return cache.has(key);
      }
    }
  
    return {
      set: (key, value) => handle('set', key, value),
      get: key => handle('get', key),
      remove: key => handle('remove', key),
      clear: () => handle('clear'),
      getAll: () => handle('getAll'),
      has: key => handle('has', key),
    };
  }
  