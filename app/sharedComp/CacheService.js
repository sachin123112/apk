import StorageService from './StorageService';

const CACHE_CONFIG = {
  subscribedChits: {
    key: "subscribedChits",
    maxAge: 5 * 60 * 1000, // 5 minutes
  },
  resourceBundle: {
    key: "resourceBundle",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  newChits: {
    key: "newChits",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  newChitsFiltered: {
    key: "newChitsFiltered",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  vacantChits: {
    key: "vacantChits",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  vacantChitsFiltered: {
    key: "vacantChitsFiltered",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  homeBanners: {
    key: "homeBanners",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
   auctionList: {
    key: "auctionListCache",
    maxAge: 5 * 60 * 1000, // 5 minutes
  },
  userData: {
    key: "userData",
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  },
  chitGroupTags: {
    key: "chitGroupTags",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours since tags don't change often
  },
  financialData: {
    key: "financialData",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours since tags don't change often
  },
    chitDetails: {
    key: "chitDetails",
    maxAge: 48 * 60 * 60 * 1000, // 2 days
  },
  quickActions: { key: "quickActions", maxAge: 48 * 60 * 60 * 1000 }, // 2 days
};

// Get all cache keys in the system
const getAllCacheKeys = () => {
  return Object.values(CACHE_CONFIG).map(cfg => cfg.key);
};

class CacheService {
  static memoryCache = {};

static async getCachedData(cacheKey, additionalKey = '') {
  const fullKey = additionalKey ? `${cacheKey}_${additionalKey}` : cacheKey;

  // 🟢 Check in-memory first
  if (this.memoryCache[fullKey]) {
    const { data, timestamp, maxAge } = this.memoryCache[fullKey];
    if (Date.now() - timestamp < maxAge) {
      return data;
    }
  }

  // 🔵 Fallback to persistent storage
  const cachedData = await StorageService.getItem(fullKey);
  if (!cachedData) return null;

  const { data, timestamp } = JSON.parse(cachedData);
  const config = Object.values(CACHE_CONFIG).find(cfg => cfg.key === cacheKey);
  if (!config) return null;

  const isExpired = Date.now() - timestamp > config.maxAge;
  if (!isExpired) {
    this.memoryCache[fullKey] = { data, timestamp, maxAge: config.maxAge };
    return data;
  }
  return null;
}


 static async setCachedData(cacheKey, data, additionalKey = '') {
  try {
    const fullKey = additionalKey ? `${cacheKey}_${additionalKey}` : cacheKey;

    // Find maxAge from CACHE_CONFIG
    const config = Object.values(CACHE_CONFIG).find(cfg => cfg.key === cacheKey);
    const maxAge = config ? config.maxAge : 5 * 60 * 1000; // default 5 min if not found

    const cacheData = {
      data,
      timestamp: Date.now(),
    };

    // Save to persistent storage
    await StorageService.setItem(fullKey, JSON.stringify(cacheData));

    // Save to in-memory cache with maxAge
    this.memoryCache[fullKey] = { ...cacheData, maxAge };
  } catch (error) {
    console.error('Cache setting error:', error);
  }
}


  static async clearCache(cacheKey, additionalKey = '') {
    try {
      if (cacheKey) {
        const fullKey = additionalKey ? `${cacheKey}_${additionalKey}` : cacheKey;
        await StorageService.removeItem(fullKey);
      } else {
        const keys = getAllCacheKeys();
        await StorageService.multiRemove(keys);
      }
    } catch (error) {
      console.error('Cache clearing error:', error);
    }
  }

  static async clearAllCache() {
    try {
      const keys = getAllCacheKeys();
      // Find all keys with additional parameters
      const allKeys = await StorageService.getAllKeys();
      const cacheBaseKeys = keys.map(key => `${key}_`);
      
      // Filter keys that start with any of our cache keys
      const allCacheKeys = allKeys.filter(key => 
        keys.includes(key) || 
        cacheBaseKeys.some(baseKey => key.startsWith(baseKey))
      );
      
      if (allCacheKeys.length > 0) {
        await StorageService.multiRemove(allCacheKeys);
      }
      // Also clear in-memory cache to avoid stale data after logout
      this.memoryCache = {};
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  static async refreshCache(cacheKey, fetchFunction, additionalKey = '') {
    try {
      const data = await fetchFunction();
      await this.setCachedData(cacheKey, data, additionalKey);
      return data;
    } catch (error) {
      console.error('Cache refresh error:', error);
      throw error;
    }
  }
  
  static createCacheKey(baseKey, params) {
    if (!params || Object.keys(params).length === 0) {
      return baseKey;
    }
    // Create a unique cache key based on parameters
    const paramsStr = JSON.stringify(params);
    return `${baseKey}_${paramsStr}`;
  }
}

export { CacheService, CACHE_CONFIG };
