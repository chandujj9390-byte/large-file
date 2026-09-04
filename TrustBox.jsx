'use client'; // Required for Next.js App Router (13/14/15)

import React, { useEffect, useRef } from 'react';

/**
 * TrustBox Component for Next.js & React Applications
 * 
 * Safely loads the Trustpilot bootstrap script and triggers
 * window.Trustpilot.loadFromElement() on client-side routing & component mount.
 */
const TrustBox = ({
  templateId = "5419b6a8b0d04a076446a9ad", // Micro Review Count / Mini TrustBox template ID placeholder
  businessUnitId = "YOUR_BUSINESS_UNIT_ID", // Replace with your Trustpilot Business Unit ID
  theme = "dark",                          // "dark" or "light"
  height = "52px",
  width = "100%",
  locale = "en-US",
  businessUnitName = "arnestories.com"
}) => {
  // 1. Create reference to the Trustpilot DOM container
  const trustboxRef = useRef(null);

  useEffect(() => {
    // Ensure this runs only in browser environments
    if (typeof window === 'undefined') return;

    const SCRIPT_URL = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';

    // 2. Load Trustpilot script asynchronously if not already in document head
    let script = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.type = 'text/javascript';
      document.head.appendChild(script);
    }

    // 3. Trigger Trustpilot.loadFromElement() when script is available & component mounts
    const initializeTrustBox = () => {
      if (window.Trustpilot && trustboxRef.current) {
        window.Trustpilot.loadFromElement(trustboxRef.current, true);
      }
    };

    if (window.Trustpilot) {
      initializeTrustBox();
    } else {
      script.addEventListener('load', initializeTrustBox);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initializeTrustBox);
      }
    };
  }, []);

  // 4. Return standard TrustBox container with placeholders & ref
  return (
    <div
      ref={trustboxRef}
      className="trustpilot-widget"
      data-locale={locale}
      data-template-id={templateId}
      data-businessunit-id={businessUnitId}
      data-businessunit-name={businessUnitName}
      data-theme={theme}
      data-style-height={height}
      data-style-width={width}
      style={{ minHeight: height, width: width, display: 'inline-block' }}
    >
      <a
        href={`https://www.trustpilot.com/review/${businessUnitName}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#00ff88', textDecoration: 'none', fontSize: '12px' }}
      >
        Trustpilot Reviews
      </a>
    </div>
  );
};

export default TrustBox;
