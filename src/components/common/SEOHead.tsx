import { Helmet } from 'react-helmet-async';
import type { SoftwareApplicationJSONLD } from '../../types/seo';

/**
 * SEOHead component handles document head metadata and JSON-LD structured data.
 */
const SEOHead = () => {
    const schema: SoftwareApplicationJSONLD = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "QR Code Generator",
        "description": "Generate high-quality QR codes instantly with real-time preview.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web",
        "url": "https://pyaethu-aung.github.io/qr-generator/",
        "image": "./logo.png",
        "featureList": "Client-side generation, Zero-backend, SVG Export",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
};

export default SEOHead;
