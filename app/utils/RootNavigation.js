import { createNavigationContainerRef } from '@react-navigation/native';
 
export const navigationRef = createNavigationContainerRef();
 
export function resetToRootTab(tabName, params = {}) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot({
      index: 0,
      routes: [
        {
          name: 'TabNavigation',
          state: {
            routes: [
              {
                name: tabName,
                params,
              },
            ],
          },
        },
      ],
    });
  }
}