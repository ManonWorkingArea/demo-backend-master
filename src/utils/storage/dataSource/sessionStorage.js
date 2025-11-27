export default function sessionStorage() {
    function handle(type, key, value) {
      if (type === 'set') {
        window.sessionStorage.setItem(key, value);
      } else if (type === 'get') {
        return window.sessionStorage.getItem(key);
      } else if (type === 'remove') {
        window.sessionStorage.removeItem(key);
      } else if (type === 'clear') {
        window.sessionStorage.clear();
      } else if (type === 'getAll') {
        const allData = {};
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          allData[key] = window.sessionStorage.getItem(key);
        }
        return allData;
      } else if (type === 'has') {
        return window.sessionStorage.getItem(key) !== null;
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
  