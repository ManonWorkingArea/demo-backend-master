// Package Validation Utilities
// Utility functions for validating package limits across the application

/**
 * Validate if a collection can add more assets based on package limits
 * @param {Object} collection - Collection object with package info
 * @param {number} additionalAssets - Number of additional assets to add (default: 1)
 * @returns {Object} Validation result
 */
export function validateAssetLimit(collection, additionalAssets = 1) {
  if (!collection || !collection.package) {
    return {
      isValid: false,
      message: 'Collection หรือ Package ไม่พบ',
      type: 'error'
    };
  }

  const packageLimits = collection.package.limits;
  const currentAssets = collection.assetsCount || 0;
  const totalAssets = currentAssets + additionalAssets;

  if (packageLimits.maxAssets && totalAssets > packageLimits.maxAssets) {
    return {
      isValid: false,
      message: `ไม่สามารถเพิ่ม Asset ได้ เนื่องจากเกินขีดจำกัด (${totalAssets}/${packageLimits.maxAssets})`,
      type: 'limit_exceeded',
      current: currentAssets,
      limit: packageLimits.maxAssets,
      additional: additionalAssets
    };
  }

  return {
    isValid: true,
    message: `สามารถเพิ่ม Asset ได้ (${totalAssets}/${packageLimits.maxAssets || 'ไม่จำกัด'})`,
    type: 'success',
    current: currentAssets,
    limit: packageLimits.maxAssets,
    additional: additionalAssets
  };
}

/**
 * Validate if a collection can add more users based on package limits
 * @param {Object} collection - Collection object with package info
 * @param {number} currentUsers - Current number of users
 * @param {number} additionalUsers - Number of additional users to add (default: 1)
 * @returns {Object} Validation result
 */
export function validateUserLimit(collection, currentUsers, additionalUsers = 1) {
  if (!collection || !collection.package) {
    return {
      isValid: false,
      message: 'Collection หรือ Package ไม่พบ',
      type: 'error'
    };
  }

  const packageLimits = collection.package.limits;
  const totalUsers = currentUsers + additionalUsers;

  if (packageLimits.maxUsers && totalUsers > packageLimits.maxUsers) {
    return {
      isValid: false,
      message: `ไม่สามารถเพิ่ม User ได้ เนื่องจากเกินขีดจำกัด (${totalUsers}/${packageLimits.maxUsers})`,
      type: 'limit_exceeded',
      current: currentUsers,
      limit: packageLimits.maxUsers,
      additional: additionalUsers
    };
  }

  return {
    isValid: true,
    message: `สามารถเพิ่ม User ได้ (${totalUsers}/${packageLimits.maxUsers || 'ไม่จำกัด'})`,
    type: 'success',
    current: currentUsers,
    limit: packageLimits.maxUsers,
    additional: additionalUsers
  };
}

/**
 * Validate storage usage based on package limits
 * @param {Object} collection - Collection object with package info
 * @param {number} currentStorageGB - Current storage usage in GB
 * @param {number} additionalStorageGB - Additional storage to use in GB (default: 0)
 * @returns {Object} Validation result
 */
export function validateStorageLimit(collection, currentStorageGB, additionalStorageGB = 0) {
  if (!collection || !collection.package) {
    return {
      isValid: false,
      message: 'Collection หรือ Package ไม่พบ',
      type: 'error'
    };
  }

  const packageLimits = collection.package.limits;
  const totalStorage = currentStorageGB + additionalStorageGB;

  if (packageLimits.storageGB && totalStorage > packageLimits.storageGB) {
    return {
      isValid: false,
      message: `ไม่สามารถใช้ Storage ได้ เนื่องจากเกินขีดจำกัด (${totalStorage.toFixed(2)}/${packageLimits.storageGB} GB)`,
      type: 'limit_exceeded',
      current: currentStorageGB,
      limit: packageLimits.storageGB,
      additional: additionalStorageGB
    };
  }

  return {
    isValid: true,
    message: `Storage ใช้งานได้ (${totalStorage.toFixed(2)}/${packageLimits.storageGB || 'ไม่จำกัด'} GB)`,
    type: 'success',
    current: currentStorageGB,
    limit: packageLimits.storageGB,
    additional: additionalStorageGB
  };
}

/**
 * Validate bandwidth usage based on package limits
 * @param {Object} collection - Collection object with package info
 * @param {number} currentBandwidthGB - Current bandwidth usage in GB
 * @param {number} additionalBandwidthGB - Additional bandwidth to use in GB (default: 0)
 * @returns {Object} Validation result
 */
export function validateBandwidthLimit(collection, currentBandwidthGB, additionalBandwidthGB = 0) {
  if (!collection || !collection.package) {
    return {
      isValid: false,
      message: 'Collection หรือ Package ไม่พบ',
      type: 'error'
    };
  }

  const packageLimits = collection.package.limits;
  const totalBandwidth = currentBandwidthGB + additionalBandwidthGB;

  if (packageLimits.bandwidth && totalBandwidth > packageLimits.bandwidth) {
    return {
      isValid: false,
      message: `ไม่สามารถใช้ Bandwidth ได้ เนื่องจากเกินขีดจำกัด (${totalBandwidth.toFixed(2)}/${packageLimits.bandwidth} GB)`,
      type: 'limit_exceeded',
      current: currentBandwidthGB,
      limit: packageLimits.bandwidth,
      additional: additionalBandwidthGB
    };
  }

  return {
    isValid: true,
    message: `Bandwidth ใช้งานได้ (${totalBandwidth.toFixed(2)}/${packageLimits.bandwidth || 'ไม่จำกัด'} GB)`,
    type: 'success',
    current: currentBandwidthGB,
    limit: packageLimits.bandwidth,
    additional: additionalBandwidthGB
  };
}

/**
 * Get package feature availability
 * @param {Object} collection - Collection object with package info
 * @param {string} feature - Feature name to check
 * @returns {Object} Feature availability result
 */
export function checkPackageFeature(collection, feature) {
  if (!collection || !collection.package) {
    return {
      available: false,
      message: 'Collection หรือ Package ไม่พบ',
      type: 'error'
    };
  }

  const packageLimits = collection.package.limits;
  const isAvailable = packageLimits[feature] === true;

  return {
    available: isAvailable,
    message: isAvailable ? 
      `${feature} ใช้งานได้ในแพ็กเกจนี้` : 
      `${feature} ไม่รองรับในแพ็กเกจนี้`,
    type: isAvailable ? 'success' : 'feature_unavailable',
    feature
  };
}

/**
 * Validate all package limits at once
 * @param {Object} collection - Collection object with package info
 * @param {Object} usage - Current usage data
 * @param {Object} additional - Additional usage to validate
 * @returns {Object} Complete validation result
 */
export function validateAllLimits(collection, usage, additional = {}) {
  const results = {
    isValid: true,
    violations: [],
    warnings: [],
    summary: {}
  };

  // Validate assets
  const assetValidation = validateAssetLimit(collection, additional.assets || 0);
  if (!assetValidation.isValid) {
    results.isValid = false;
    results.violations.push(assetValidation);
  }
  results.summary.assets = assetValidation;

  // Validate users
  if (usage.users !== undefined) {
    const userValidation = validateUserLimit(collection, usage.users, additional.users || 0);
    if (!userValidation.isValid) {
      results.isValid = false;
      results.violations.push(userValidation);
    }
    results.summary.users = userValidation;
  }

  // Validate storage
  if (usage.storageGB !== undefined) {
    const storageValidation = validateStorageLimit(collection, usage.storageGB, additional.storageGB || 0);
    if (!storageValidation.isValid) {
      results.isValid = false;
      results.violations.push(storageValidation);
    }
    results.summary.storage = storageValidation;
  }

  // Validate bandwidth
  if (usage.bandwidthGB !== undefined) {
    const bandwidthValidation = validateBandwidthLimit(collection, usage.bandwidthGB, additional.bandwidthGB || 0);
    if (!bandwidthValidation.isValid) {
      results.isValid = false;
      results.violations.push(bandwidthValidation);
    }
    results.summary.bandwidth = bandwidthValidation;
  }

  return results;
}

/**
 * Format package limit display text
 * @param {Object} limits - Package limits object
 * @param {Object} current - Current usage object
 * @returns {Object} Formatted display data
 */
export function formatPackageLimits(limits, current = {}) {
  const formatLimit = (value, unit = '') => {
    return value ? `${value}${unit}` : 'ไม่จำกัด';
  };

  const formatUsage = (currentVal, limitVal, unit = '') => {
    const currentDisplay = currentVal || 0;
    const limitDisplay = limitVal ? `${limitVal}${unit}` : 'ไม่จำกัด';
    return `${currentDisplay}${unit} / ${limitDisplay}`;
  };

  return {
    assets: {
      limit: formatLimit(limits.maxAssets),
      usage: formatUsage(current.assets, limits.maxAssets),
      percentage: limits.maxAssets ? Math.round((current.assets || 0) / limits.maxAssets * 100) : 0
    },
    users: {
      limit: formatLimit(limits.maxUsers),
      usage: formatUsage(current.users, limits.maxUsers),
      percentage: limits.maxUsers ? Math.round((current.users || 0) / limits.maxUsers * 100) : 0
    },
    storage: {
      limit: formatLimit(limits.storageGB, ' GB'),
      usage: formatUsage(current.storageGB, limits.storageGB, ' GB'),
      percentage: limits.storageGB ? Math.round((current.storageGB || 0) / limits.storageGB * 100) : 0
    },
    bandwidth: {
      limit: formatLimit(limits.bandwidth, ' GB'),
      usage: formatUsage(current.bandwidthGB, limits.bandwidth, ' GB'),
      percentage: limits.bandwidth ? Math.round((current.bandwidthGB || 0) / limits.bandwidth * 100) : 0
    }
  };
}

export default {
  validateAssetLimit,
  validateUserLimit,
  validateStorageLimit,
  validateBandwidthLimit,
  checkPackageFeature,
  validateAllLimits,
  formatPackageLimits
};
