// languages.js
import { loadAndStoreConfigData } from './config.js'; // Adjust the path as necessary
import storageManager from '@/plugins/storage';
import { useRoute } from 'vue-router'; // Import useRoute from Vue Router
import toast from '@/plugins/ToastUI.js';

/**
 * Retrieves the current language settings from storage.
 * @returns {Object} The current language settings.
 */
export function getCurrentLanguage() {
  return storageManager.get('available') || {};
}

/**
 * Updates the application's language by loading and storing new language-specific config data.
 * @param {String} languageCode The new language code to set.
 */
export async function setLanguage(languageCode) {
  try {
    storageManager.set('available', languageCode);
    toast({ type: 'success', message: `Change Language Success`, autohide: true });
    await loadAndStoreConfigData(true, languageCode);
    window.location.reload();
    console.log(`Language has been set to ${languageCode}`);
  } catch (error) {
    console.error('Failed to set new language:', error);
  }
}

/**
* Retrieves the translation for a given key from the current language's translations.
* @param {String} key The key to translate.
* @returns {String} The translated string or the key itself if a translation is not found.
*/
export function translate(key) {
  // Retrieve the current language settings, including translations
  const languageData = storageManager.get('translate') || {};
  const translations = languageData || {};

  // Split the key into category and subkey only at the first occurrence of '-'
  const index = key.indexOf('-');
  const category = index !== -1 ? key.substring(0, index) : key;
  const subkey = index !== -1 ? key.substring(index + 1) : '';

  // Check if the category exists in translations
  if (translations[category]) {
    // Return the translation for the subkey if it exists, otherwise return the key itself
    return translations[category][subkey] || key;
  } else {
    // If the category doesn't exist, return the key itself
    return key;
  }
}

/**
 * Retrieves all language settings from storage.
 * @returns {Array} Array of language settings objects.
 */
export function getAllLanguages() {
  // Retrieve all language settings from storage
  return storageManager.get('language') || [];
}

// In your language.js or wherever routerMeta is defined
export function getRouteTitle() {
  const route = useRoute(); // useRoute to access the current route within Composition API
  const currentLanguage = getCurrentLanguage(); // Assuming this function is reactive or returns a consistent value

  // Similar logic to determine the route title based on the type of route.meta.title
  let routeTitle;
  if (typeof route.meta.title === 'object') {
    routeTitle = route.meta.title[currentLanguage] || 'Title not found';
  } else {
    routeTitle = route.meta.title || 'Title not set';
  }

  return routeTitle; // Return the route title instead of logging it
}
