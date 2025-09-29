import { Configuration, PopupRequest } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || 'your-azure-client-id',
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || 'your-tenant-id'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case 0: // Error
            console.error('MSAL Error:', message);
            break;
          case 1: // Warning
            console.warn('MSAL Warning:', message);
            break;
          case 2: // Info
            console.info('MSAL Info:', message);
            break;
          case 3: // Verbose
            console.log('MSAL Verbose:', message);
            break;
        }
      },
      piiLoggingEnabled: false,
    },
  },
};

// Login request configuration
export const loginRequest: PopupRequest = {
  scopes: [
    'User.Read',
    'https://management.azure.com/user_impersonation', // For Azure PowerShell
  ],
  prompt: 'select_account',
};

// Azure PowerShell token request
export const azurePowerShellRequest: PopupRequest = {
  scopes: ['https://management.azure.com/user_impersonation'],
  prompt: 'none',
};

// Check if we're in standalone mode
export const isStandaloneMode = process.env.REACT_APP_STANDALONE_MODE === 'true';

// API base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Application settings
export const APP_CONFIG = {
  name: 'Lumo',
  version: '1.0.0',
  description: 'PowerShell Web Editor',
  maxScriptSize: 200 * 1024, // 200KB
  maxExecutionTime: 300000, // 5 minutes
  defaultPageSize: 20,
  supportedFileTypes: ['.ps1', '.json'],
  features: {
    azureIntegration: !isStandaloneMode,
    exportImport: true,
    darkMode: true,
    notifications: true,
  },
};