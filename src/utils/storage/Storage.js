import localStorage from './dataSource/localStorage';
import sessionStorage from './dataSource/sessionStorage';
import cookie from './dataSource/cookie';
import cache from './dataSource/cache';
import {s3} from './dataSource/s3';

export default function StorageManager(type = 'localStorage') {
  let dataSource;

  if (type === 'localStorage') {
    dataSource = localStorage();
  } else if (type === 'sessionStorage') {
    dataSource = sessionStorage();
  } else if (type === 'cookie') {
    dataSource = cookie();
  } else if (type === 'cache') {
    dataSource = cache();
  } else if (type === 's3') {
    dataSource = s3();
  } else {
    throw new Error(`Invalid storage type: ${type}`);
  }

  const { set: setData, get: getData, remove: deleteData, clear: clearData, getAll: getAllData, has: hasData } = dataSource;

  this.set = function(key, value) {
    const dataString = JSON.stringify(value);
    setData(key, dataString);
  }

  this.get = async function(key, keys) {
    let data;
    if (keys) {
      // Retrieve multiple data items
      data = {};
      for (const k of keys) {
        const dataString = await getData(k);
        if (dataString) {
          data[k] = JSON.parse(dataString);
        }
      }
    } else {
      // Retrieve single data item
      const dataString = await getData(key);
      if (dataString) {
        data = JSON.parse(dataString);
      } else {
        data = undefined;
      }
    }
    return data;
  }

  this.remove = function(key) {
    deleteData(key);
  }

  this.clear = function(key) {
    clearData(key);
  }

  this.getAll = function() {
    return getAllData();
  }

  this.has = function(key) {
    return hasData(key);
  }
}
