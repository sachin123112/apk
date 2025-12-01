import SessionStorage from 'react-native-session-storage';

// Try to import AsyncStorage, but don't fail if it's not available
let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.warn('AsyncStorage module could not be loaded, falling back to SessionStorage');
  AsyncStorage = null;
}

/**
 * Storage Service - A wrapper that tries AsyncStorage first, then falls back to SessionStorage
 * This provides graceful degradation while maintaining a consistent API
 */
class StorageService {
  /**
   * Store a string value in storage
   * @param {string} key The key to store under
   * @param {string} value The string value to store
   * @returns {Promise<void>}
   */
  static async setItem(key, value) {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.setItem(key, value);
      } else {
        SessionStorage.setItem(key, value);
        return Promise.resolve();
      }
    } catch (error) {
      console.warn('StorageService setItem failed, falling back to SessionStorage', error);
      try {
        SessionStorage.setItem(key, value);
        return Promise.resolve();
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }
  }

  /**
   * Retrieve a string value from storage
   * @param {string} key The key to retrieve
   * @returns {Promise<string|null>} The stored value or null if not found
   */
  static async getItem(key) {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      } else {
        const value = SessionStorage.getItem(key);
        return Promise.resolve(value);
      }
    } catch (error) {
      console.warn('StorageService getItem failed, falling back to SessionStorage', error);
      try {
        const value = SessionStorage.getItem(key);
        return Promise.resolve(value);
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }
  }

  /**
   * Remove an item from storage
   * @param {string} key The key to remove
   * @returns {Promise<void>}
   */
  static async removeItem(key) {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.removeItem(key);
      } else {
        SessionStorage.removeItem(key);
        return Promise.resolve();
      }
    } catch (error) {
      console.warn('StorageService removeItem failed, falling back to SessionStorage', error);
      try {
        SessionStorage.removeItem(key);
        return Promise.resolve();
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }
  }

  /**
   * Clear all stored items
   * @returns {Promise<void>}
   */
  static async clear() {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.clear();
      } else {
        SessionStorage.clear();
        return Promise.resolve();
      }
    } catch (error) {
      console.warn('StorageService clear failed, falling back to SessionStorage', error);
      try {
        SessionStorage.clear();
        return Promise.resolve();
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }
  }

  /**
   * Store multiple key-value pairs
   * @param {Array<Array<string>>} keyValuePairs Array of [key, value] pairs
   * @returns {Promise<void>}
   */
  static async multiSet(keyValuePairs) {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.multiSet(keyValuePairs);
      } else {
        keyValuePairs.forEach(([key, value]) => {
          SessionStorage.setItem(key, value);
        });
        return Promise.resolve();
      }
    } catch (error) {
      console.warn('StorageService multiSet failed, falling back to SessionStorage', error);
      try {
        keyValuePairs.forEach(([key, value]) => {
          SessionStorage.setItem(key, value);
        });
        return Promise.resolve();
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }
  }

  /**
   * Get multiple items at once
   * @param {Array<string>} keys Array of keys to retrieve
   * @returns {Promise<Array<Array<string>>>} Array of [key, value] pairs
   */
  static async multiGet(keys) {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.multiGet(keys);
      } else {
        const results = keys.map(key => {
          const value = SessionStorage.getItem(key);
          return [key, value];
        });
        return Promise.resolve(results);
      }
    } catch (error) {
      console.warn('StorageService multiGet failed, falling back to SessionStorage', error);
      try {
        const results = keys.map(key => {
          const value = SessionStorage.getItem(key);
          return [key, value];
        });
        return Promise.resolve(results);
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }
  }

  /**
   * Remove multiple items at once
   * @param {Array<string>} keys Array of keys to remove
   * @returns {Promise<void>}
   */
  static async multiRemove(keys) {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.multiRemove(keys);
      } else {
        keys.forEach(key => {
          SessionStorage.removeItem(key);
        });
        return Promise.resolve();
      }
    } catch (error) {
      console.warn('StorageService multiRemove failed, falling back to SessionStorage', error);
      try {
        keys.forEach(key => {
          SessionStorage.removeItem(key);
        });
        return Promise.resolve();
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }
  }

  /**
   * Get all keys in storage
   * @returns {Promise<Array<string>>} Array of keys
   */
  static async getAllKeys() {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.getAllKeys();
      } else {
        return Promise.resolve(SessionStorage.getAllKeys());
      }
    } catch (error) {
      console.warn('StorageService getAllKeys failed, falling back to SessionStorage', error);
      try {
        return Promise.resolve(SessionStorage.getAllKeys());
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }
  }
}

export default StorageService;
