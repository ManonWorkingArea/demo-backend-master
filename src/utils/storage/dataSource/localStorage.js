export default function localStorage() {
    function handle(type, key, value) {
      if (type === 'set') {
        window.localStorage.setItem(key, value);
      } else if (type === 'get') {
        return window.localStorage.getItem(key);
      } else if (type === 'remove') {
        window.localStorage.removeItem(key);
      } else if (type === 'clear') {
        window.localStorage.clear();
      } else if (type === 'getAll') {
        const allData = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          allData[key] = window.localStorage.getItem(key);
        }
        return allData;
      } else if (type === 'has') {
        return window.localStorage.getItem(key) !== null;
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
  