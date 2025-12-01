import { useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const useNavigationGuard = (navigation) => {
  const isNavigatingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Reset navigation flag when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      isNavigatingRef.current = false;
      isMountedRef.current = true;
      
      return () => {
        isMountedRef.current = false;
      };
    }, [])
  );

  const navigateWithGuard = useCallback((routeName, params = {}) => {
    // Block if already navigating or component unmounted
    if (isNavigatingRef.current || !isMountedRef.current) {
      console.log('Navigation blocked - already navigating or unmounted');
      return false;
    }

    // Set navigation flag
    isNavigatingRef.current = true;

    // Navigate after small delay to prevent rapid clicks
    setTimeout(() => {
      if (isMountedRef.current) {
        try {
          navigation.navigate(routeName, params);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
      
      // Reset flag after 500ms
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
    }, 50);

    return true;
  }, [navigation]);

  return { navigateWithGuard };
};

export default useNavigationGuard;