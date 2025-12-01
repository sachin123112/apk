import crashlytics from '@react-native-firebase/crashlytics';

const CrashlyticsService = {

  init() {
    crashlytics().setCrashlyticsCollectionEnabled(true);
    crashlytics().log('Crashlytics initialized');
    console.log('[Crashlytics] Initialized');
  },

  /**
   * Record a breadcrumb log message - accumulates context for crashes
   */
  log(message) {
    if (!message) return;
    crashlytics().log(message);
    console.log('[Crashlytics Log]:', message);
  },

  /**
   * Record a non-fatal JavaScript error with full stack trace
   * Use this for caught errors that you want to track
   */
  recordError(error, context = '') {
    try {
      if (context) {
        crashlytics().log(`Context: ${context}`);
      }
      
      // Ensure error is an Error object
      const errorObj = error instanceof Error 
        ? error 
        : new Error(typeof error === 'string' ? error : JSON.stringify(error));
      
      crashlytics().recordError(errorObj);
      console.error('[Crashlytics recordError]:', context, errorObj);
    } catch (e) {
      console.error('[CrashlyticsService recordError Error]:', e);
    }
  },

  /**
   * Record a non-fatal error with additional custom attributes
   * @param {Error} error - The error object
   * @param {string} context - Context description
   * @param {object} attributes - Additional key-value pairs for filtering
   */
  recordErrorWithAttributes(error, context = '', attributes = {}) {
    try {
      // Log context
      if (context) {
        crashlytics().log(`Context: ${context}`);
      }

      // Set custom attributes for this error
      if (attributes && Object.keys(attributes).length > 0) {
        crashlytics().setAttributes(attributes);
      }

      // Ensure error is an Error object
      const errorObj = error instanceof Error 
        ? error 
        : new Error(typeof error === 'string' ? error : JSON.stringify(error));
      
      crashlytics().recordError(errorObj);
      console.error('[Crashlytics Error with Attributes]:', context, attributes, errorObj);
    } catch (e) {
      console.error('[CrashlyticsService recordErrorWithAttributes Error]:', e);
    }
  },

  /**
   * Track PDF-specific errors (for your libpdfium crashes)
   */
  recordPDFError(error, pdfDetails = {}) {
    try {
      // Create detailed context
      const context = `PDF Error - ${pdfDetails.operation || 'Unknown operation'}`;
      crashlytics().log(context);

      // Set PDF-specific attributes
      const attributes = {
        error_type: 'PDF_ERROR',
        pdf_operation: pdfDetails.operation || 'unknown',
        pdf_source: pdfDetails.source || 'unknown',
        pdf_size: String(pdfDetails.size || 0),
        pdf_tag_id: String(pdfDetails.tagId || 'unknown'),
        pdf_is_current: String(pdfDetails.isCurrentPdf || false),
      };

      // Add any additional details
      if (pdfDetails.url) {
        crashlytics().log(`PDF URL: ${pdfDetails.url}`);
        attributes.pdf_has_url = 'true';
      }
      if (pdfDetails.errorCode) {
        attributes.pdf_error_code = String(pdfDetails.errorCode);
      }

      crashlytics().setAttributes(attributes);

      // Record the error
      const errorObj = error instanceof Error 
        ? error 
        : new Error(`PDF Error: ${error?.message || JSON.stringify(error)}`);
      
      crashlytics().recordError(errorObj);
      console.error('[Crashlytics PDF Error]:', context, attributes, errorObj);
    } catch (e) {
      console.error('[CrashlyticsService recordPDFError Error]:', e);
    }
  },

  /**
   * Track network/API errors
   */
  recordNetworkError(error, requestDetails = {}) {
    try {
      const context = `Network Error - ${requestDetails.endpoint || 'Unknown endpoint'}`;
      crashlytics().log(context);

      const attributes = {
        error_type: 'NETWORK_ERROR',
        endpoint: requestDetails.endpoint || 'unknown',
        method: requestDetails.method || 'GET',
        status_code: String(requestDetails.statusCode || 0),
        request_id: requestDetails.requestId || 'unknown',
      };

      if (requestDetails.responseTime) {
        attributes.response_time_ms = String(requestDetails.responseTime);
      }

      crashlytics().setAttributes(attributes);
      
      const errorObj = error instanceof Error 
        ? error 
        : new Error(`Network Error: ${error?.message || JSON.stringify(error)}`);
      
      crashlytics().recordError(errorObj);
      console.error('[Crashlytics Network Error]:', context, attributes, errorObj);
    } catch (e) {
      console.error('[CrashlyticsService recordNetworkError Error]:', e);
    }
  },

  /**
   * Track payment-related errors
   */
  recordPaymentError(error, paymentDetails = {}) {
    try {
      const context = `Payment Error - ${paymentDetails.gateway || 'Unknown gateway'}`;
      crashlytics().log(context);

      const attributes = {
        error_type: 'PAYMENT_ERROR',
        payment_gateway: paymentDetails.gateway || 'unknown',
        payment_stage: paymentDetails.stage || 'unknown',
        order_id: paymentDetails.orderId || 'unknown',
        amount: String(paymentDetails.amount || 0),
      };

      crashlytics().setAttributes(attributes);
      
      const errorObj = error instanceof Error 
        ? error 
        : new Error(`Payment Error: ${error?.message || JSON.stringify(error)}`);
      
      crashlytics().recordError(errorObj);
      console.error('[Crashlytics Payment Error]:', context, attributes, errorObj);
    } catch (e) {
      console.error('[CrashlyticsService recordPaymentError Error]:', e);
    }
  },

  /**
   * Track navigation errors
   */
  recordNavigationError(error, navigationDetails = {}) {
    try {
      const context = `Navigation Error - ${navigationDetails.screen || 'Unknown screen'}`;
      crashlytics().log(context);

      const attributes = {
        error_type: 'NAVIGATION_ERROR',
        target_screen: navigationDetails.screen || 'unknown',
        current_screen: navigationDetails.currentScreen || 'unknown',
        action: navigationDetails.action || 'unknown',
      };

      if (navigationDetails.params) {
        crashlytics().log(`Navigation Params: ${JSON.stringify(navigationDetails.params)}`);
      }

      crashlytics().setAttributes(attributes);
      
      const errorObj = error instanceof Error 
        ? error 
        : new Error(`Navigation Error: ${error?.message || JSON.stringify(error)}`);
      
      crashlytics().recordError(errorObj);
      console.error('[Crashlytics Navigation Error]:', context, attributes, errorObj);
    } catch (e) {
      console.error('[CrashlyticsService recordNavigationError Error]:', e);
    }
  },

  /**
   * Log screen view for tracking user journey before crash
   */
  logScreenView(screenName, params = {}) {
    try {
      crashlytics().log(`Screen: ${screenName}`);
      
      if (Object.keys(params).length > 0) {
        crashlytics().log(`Screen Params: ${JSON.stringify(params)}`);
      }

      crashlytics().setAttribute('last_screen', screenName);
      console.log('[Crashlytics Screen View]:', screenName, params);
    } catch (e) {
      console.error('[CrashlyticsService logScreenView Error]:', e);
    }
  },

  /**
   * Log user action for tracking behavior before crash
   */
  logUserAction(action, details = {}) {
    try {
      const message = `User Action: ${action}`;
      crashlytics().log(message);
      
      if (Object.keys(details).length > 0) {
        crashlytics().log(`Action Details: ${JSON.stringify(details)}`);
      }

      console.log('[Crashlytics User Action]:', action, details);
    } catch (e) {
      console.error('[CrashlyticsService logUserAction Error]:', e);
    }
  },

  /**
   * Set the currently logged-in user details
   */
  setUser(user) {
    try {
      if (user?.id) crashlytics().setUserId(String(user.id));
      
      const attributes = {};
      if (user?.name) attributes.username = user.name;
      if (user?.email) attributes.email = user.email;
      if (user?.phone) attributes.phone = user.phone;
      if (user?.role) attributes.user_role = user.role;
      
      if (Object.keys(attributes).length > 0) {
        crashlytics().setAttributes(attributes);
      }

      crashlytics().log(`User set: ${user?.name || user?.id || 'Unknown'}`);
      console.log('[Crashlytics] User info set:', user);
    } catch (e) {
      console.error('[Crashlytics setUser Error]:', e);
    }
  },

  /**
   * Clear user data (on logout)
   */
  clearUser() {
    try {
      crashlytics().setUserId('');
      crashlytics().log('User logged out - cleared user data');
      console.log('[Crashlytics] User data cleared');
    } catch (e) {
      console.error('[Crashlytics clearUser Error]:', e);
    }
  },

  /**
   * Record custom app attributes for better filtering
   */
  setAttribute(key, value) {
    try {
      crashlytics().setAttribute(key, String(value));
      console.log(`[Crashlytics Attribute]: ${key} = ${value}`);
    } catch (e) {
      console.error('[Crashlytics setAttribute Error]:', e);
    }
  },

  /**
   * Set multiple attributes at once
   */
  setAttributes(attributes = {}) {
    try {
      const stringAttributes = {};
      Object.keys(attributes).forEach(key => {
        stringAttributes[key] = String(attributes[key]);
      });
      crashlytics().setAttributes(stringAttributes);
      console.log('[Crashlytics Attributes Set]:', stringAttributes);
    } catch (e) {
      console.error('[Crashlytics setAttributes Error]:', e);
    }
  },

  /**
   * Log app state information
   */
  logAppState(state, details = {}) {
    try {
      crashlytics().log(`App State: ${state}`);
      
      if (Object.keys(details).length > 0) {
        crashlytics().log(`State Details: ${JSON.stringify(details)}`);
      }

      crashlytics().setAttribute('app_state', state);
      console.log('[Crashlytics App State]:', state, details);
    } catch (e) {
      console.error('[CrashlyticsService logAppState Error]:', e);
    }
  },

  /**
   * Force a crash (for testing only - remove in production)
   */
  forceCrash() {
    crashlytics().log('Force crash triggered - TEST ONLY');
    console.warn('[Crashlytics] Forcing crash for testing');
    crashlytics().crash();
  },

  /**
   * Test error logging (for testing only)
   */
  testErrorLogging() {
    try {
      crashlytics().log('Testing error logging');
      const testError = new Error('Test error for Crashlytics verification');
      testError.name = 'TestError';
      crashlytics().recordError(testError);
      console.log('[Crashlytics] Test error logged');
    } catch (e) {
      console.error('[CrashlyticsService testErrorLogging Error]:', e);
    }
  },
};

export default CrashlyticsService;
