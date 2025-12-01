import StorageService from './StorageService';

// Check if StorageService is properly initialized
const checkStorage = () => {
  if (!StorageService) {
    console.error('StorageService is not available!');
    return false;
  }
  return true;
};

export const storeStringData = async (key, value) => {
  try {
    if (!checkStorage()) return false;
    await StorageService.setItem(key, value);
    return true;
  } catch (e) {
    console.error(`Error storing string for key "${key}":`, e);
    return false;
  }
};

export const storeObjectData = async (key, value) => {
  try {
    if (!checkStorage()) return false;
    const jsonValue = JSON.stringify(value);
    await StorageService.setItem(key, jsonValue);
    return true;
  } catch (e) {
    console.error(`Error storing object for key "${key}":`, e);
    return false;
  }
};

export const getObjectData = async (key) => {
  try {
    if (!checkStorage()) return null;
    const jsonValue = await StorageService.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(`Error reading object for key "${key}":`, e);
    return null;
  }
};

export const getStringData = async (key) => {
  try {
    if (!checkStorage()) return null;
    const value = await StorageService.getItem(key);
    return value;
  } catch (e) {
    console.error(`Error reading string for key "${key}":`, e);
    return null;
  }
};

export const removeAsyncData = async (key) => {
  try {
    if (!checkStorage()) return false;
    await StorageService.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Error removing key "${key}":`, e);
    return false;
  }
};