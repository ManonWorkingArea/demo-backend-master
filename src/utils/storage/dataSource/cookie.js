export default function cookie() {
    function handle(type, key, value, options = {}) {
      if (type === 'set') {
        const expires = options.expires ? `; expires=${options.expires.toUTCString()}` : '';
        const path = options.path ? `; path=${options.path}` : '';
        const domain = options.domain ? `; domain=${options.domain}` : '';
        const secure = options.secure ? '; secure' : '';
        document.cookie = `${key}=${value}${expires}${path}${domain}${secure}`;
      } else if (type === 'get') {
        const keyValue = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
        return keyValue ? keyValue[2] : null;
      } else if (type === 'remove') {
        handle('set', key, '', { expires: new Date(0) });
      } else if (type === 'clear') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          handle('remove', cookies[i].split('=')[0].trim());
        }
      } else if (type === 'getAll') {
        const allData = {};
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const key = cookies[i].split('=')[0].trim();
          allData[key] = handle('get', key);
        }
        return allData;
      } else if (type === 'has') {
        return handle('get', key) !== null;
      }
    }
  
  
    return {
      set: (key, value, options) => handle('set', key, value, options),
      get: key => handle('get', key),
      remove: key => handle('remove', key),
      clear: () => handle('clear'),
      getAll: () => handle('getAll'),
      has: key => handle('has', key),
    };
  }
  