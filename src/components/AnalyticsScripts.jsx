// src/components/AnalyticsScripts.jsx
'use client';

import { useEffect } from "react";

export default function AnalyticsScripts() {
  useEffect(() => {
    const loadScripts = () => {
      // Google Analytics
      const ga = document.createElement("script");
      ga.src = "https://www.googletagmanager.com/gtag/js?id=G-RMD1BWW0YY";
      ga.async = true;
      document.head.appendChild(ga);

      const gaInit = document.createElement("script");
      gaInit.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-RMD1BWW0YY');
      `;
      document.head.appendChild(gaInit);

      // GTM
      const gtm = document.createElement("script");
      gtm.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-PHL73GLL');
      `;
      document.head.appendChild(gtm);

      // Meta Pixel
      const fbPixel = document.createElement("script");
      fbPixel.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1743615176583640');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbPixel);
    };

    const delay = setTimeout(loadScripts, 2000);
    window.addEventListener("scroll", loadScripts, { once: true });
    return () => clearTimeout(delay);
  }, []);

  return null;
}
