import storageManager from '@/plugins/storage';
import { key } from '@/master/host.js';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);
import debug from '@/plugins/Logger.js';

async function getItemByCode(data, code) {
  if (!Array.isArray(data)) {
    debug.log("Data is not an array");
    return null;
  }
  
  const item = data.find(item => item.code === code);
  if (item) {
    debug.log("Found item:", item);
    return item;
  } else {
    debug.log(`Item with code ${code} not found.`);
    return null;
  }
}


async function convertToSimplifiedArray(data) {
  if (!Array.isArray(data)) {
    debug.log("Data is not an array, returning empty array");
    return [];
  }
  
  const simplifiedData = data.map(item => ({
    code: item.code,
    name: item.name,
    flag: item.flag
  }));
  return simplifiedData;
}

// Helper function to format lastUpdate
function formatConfigWithLastUpdate(config) {
  return {
    ...config,
    lastUpdate: new Date(config.lastUpdate).toLocaleString()
  };
}

export async function loadAndStoreConfigData(force = false) {
  const urlParams = new URLSearchParams(window.location.search);
  const previewHostname = urlParams.get('preview');

  if (previewHostname) {
    storageManager.delete('hostname');
    storageManager.set('hostname', previewHostname);
    urlParams.delete('preview');
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' : ''}${urlParams.toString()}`;
    window.history.replaceState({}, document.title, newUrl);
    storageManager.delete('configs');
    storageManager.delete('session');
  }

  const storedConfigData  = storageManager.get('configs');
  const hasStoredData     = storedConfigData && storedConfigData.expires > Date.now();
  const shouldLoadData    = force || !hasStoredData;

  if (shouldLoadData) {
    try {
      const { status, data } = await Request.GET(`hostname`, key);

      if (status === 200) {
        const configData = data;
        const hostname = storageManager.get('hostname') || window.location.hostname || 'localhost';
        const selectedConfig = configData.find(config => config.hostname === hostname);

        debug.log("selectedConfig", selectedConfig);

        if (!selectedConfig) {
          throw new Error('Could not find configuration for current hostname');
        }

        // Get space data with error handling
        const responseSpace = await Request.GET(`space/${selectedConfig.spaceId}`, key);
        if (!responseSpace.data) {
          throw new Error('Failed to retrieve space data');
        }
        const spaceData = responseSpace.data;
        const expirationTime = Date.now() + 60000; // expiration time set to 1 minute

        // Get translation data with error handling
        const resAPI = await Request.POST('translate/query', {
          method: 'find',
          args: [{
            $and: [{}]
          }]
        }, key);

        if (!resAPI.data) {
          throw new Error('Failed to retrieve translation data');
        }

        const languageCode = storageManager.get('available') || 'TH';
        debug.log("languageCode", languageCode);
        
        // Set the language code in storage if it's not already defined
        if (!storageManager.get('available')) {
          storageManager.set('available', languageCode);
        }

        const itemByCode = await getItemByCode(resAPI.data, languageCode);
        const simplifiedData = await convertToSimplifiedArray(resAPI.data);
        
        // Check if itemByCode exists and has translations
        if (!itemByCode || !itemByCode.translations) {
          debug.log(`Warning: No translations found for language code ${languageCode}`);
        }

        storageManager.set('language', simplifiedData);
        storageManager.set('translate', itemByCode?.translations || {});

        const config = {
          siteID: selectedConfig._id,
          hostname: selectedConfig.hostname,
          key: selectedConfig.key,
          homepage: selectedConfig?.theme?.homepage || '',
          header: selectedConfig?.theme?.header || '',
          subheader: selectedConfig?.theme?.subheader || '',
          footer: selectedConfig?.theme?.footer || '',
          navigator: selectedConfig?.theme?.navigator || '',
          siteName: selectedConfig.siteName,
          siteLogo: selectedConfig.siteLogo,
          siteFavicon: selectedConfig.siteFavicon,
          siteStyle: selectedConfig.siteStyle,
          siteSubStyle: selectedConfig.siteSubStyle,
          siteType: selectedConfig.siteType,
          loginLogo: selectedConfig.loginLogo,
          loginBg: selectedConfig.loginBg,
          dashboardBg: selectedConfig.dashboardBg,
          dashboardGradientColor1: selectedConfig.dashboardGradientColor1,
          dashboardGradientColor2: selectedConfig.dashboardGradientColor2,
          plugins: selectedConfig.plugins,
          defaultPlugin: selectedConfig.defaultPlugin,
          defaultLogin: selectedConfig.defaultLogin,
          s3Key: spaceData.s3Key,
          s3Endpoint: spaceData.s3Endpoint,
          s3Hosting: spaceData.s3Hosting,
          s3Secret: spaceData.s3Secret,
          s3Region: spaceData.s3Region,
          s3EndpointDefault: spaceData.s3EndpointDefault,
          s3Bucket: spaceData.s3Bucket,
          spaceId: spaceData._id,
          expires: expirationTime,
          layout: selectedConfig.layout,
          menu: selectedConfig.menu,
          email_from_email: selectedConfig.email_from_email,
          email_from_name: selectedConfig.email_from_name,
          email_url: selectedConfig.email_url,
          email_key: selectedConfig.email_key,
          email_provider: selectedConfig.email_provider,
          lastUpdate: new Date().getTime(),
          line: selectedConfig.line || undefined
        };

        storageManager.set('configs', config);
        return formatConfigWithLastUpdate(config);
        
      } else {
        throw new Error(`Failed to load config data. Status: ${status}`);
      }
    } catch (error) {
      debug.log("Error loading config data:", error);
      // Return cached data if available, otherwise throw error
      if (storedConfigData) {
        debug.log("Returning cached data due to error");
        return formatConfigWithLastUpdate(storedConfigData);
      }
      throw error;
    }
  } else {
    debug.log("no shouldLoadData");
    return formatConfigWithLastUpdate(storedConfigData);
  }
}
