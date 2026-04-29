import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { brandingAPI } from '../api/core';
import defaultLogo from '/vardhan-erp.svg';

const DEFAULTS = {
  systemName: 'Vardhan ERP',
  logoUrl: defaultLogo,
  faviconUrl: '',
  loginBgUrl: '',
  primaryColor: '#6366f1',
  secondaryColor: '#10b981',
  darkModeDefault: 'system',
};

const BrandingContext = createContext(null);

function applyBrandColors(primary, secondary) {
  document.documentElement.style.setProperty('--brand-primary', primary);
  document.documentElement.style.setProperty('--brand-secondary', secondary);
}

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULTS);

  const refreshBranding = useCallback(async () => {
    try {
      const { data } = await brandingAPI.get();
      const newBranding = {
        systemName: data.system_name || DEFAULTS.systemName,
        logoUrl: data.logo_url || DEFAULTS.logoUrl,
        faviconUrl: data.favicon_url || '',
        loginBgUrl: data.login_bg_url || '',
        primaryColor: data.primary_color || DEFAULTS.primaryColor,
        secondaryColor: data.secondary_color || DEFAULTS.secondaryColor,
        darkModeDefault: data.dark_mode_default || DEFAULTS.darkModeDefault,
      };
      setBranding(newBranding);

      document.title = newBranding.systemName;
      applyBrandColors(newBranding.primaryColor, newBranding.secondaryColor);

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
      applyBrandColors(DEFAULTS.primaryColor, DEFAULTS.secondaryColor);
    }
  }, []);

  useEffect(() => {
    applyBrandColors(DEFAULTS.primaryColor, DEFAULTS.secondaryColor);
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
