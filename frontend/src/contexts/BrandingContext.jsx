import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { brandingAPI } from '../api/core';
import logo from '../../public/UAC.svg'

const DEFAULTS = {
  systemName: 'Umiya Chemical Dashboard',
  logoUrl: logo,
  faviconUrl: '',
};

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULTS);

  const refreshBranding = useCallback(async () => {
    try {
      const { data } = await brandingAPI.get();
      const newBranding = {
        systemName: data.system_name || DEFAULTS.systemName,
        logoUrl: data.logo_url || DEFAULTS.logoUrl,
        faviconUrl: data.favicon_url || '',
      };
      setBranding(newBranding);

      // Update page title
      document.title = newBranding.systemName;

      // Update favicon
      if (newBranding.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = newBranding.faviconUrl;
      }
    } catch {
      // Use defaults if API fails (e.g. not logged in)
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshBranding();
    }
  }, [refreshBranding]);

  const value = useMemo(() => ({ ...branding, refreshBranding }), [refreshBranding, branding]);

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) throw new Error('useBranding must be used within BrandingProvider');
  return context;
}

BrandingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};