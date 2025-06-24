export const updateMetaTags = (sellToken: string, buyToken: string) => {
  const title = `${sellToken} to ${buyToken} Swap | Trunkswap Exchange`;
  const description = `Swap ${sellToken} for ${buyToken} instantly on Trunkswap. Best rates, low fees, secure decentralized exchange.`;

  // Update document title
  document.title = title;

  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  } else {
    const newMeta = document.createElement("meta");
    newMeta.name = "description";
    newMeta.content = description;
    document.head.appendChild(newMeta);
  }

  // Update Open Graph tags for social sharing
  const updateOrCreateOGTag = (property: string, content: string) => {
    let ogTag = document.querySelector(`meta[property="${property}"]`);
    if (ogTag) {
      ogTag.setAttribute("content", content);
    } else {
      ogTag = document.createElement("meta");
      ogTag.setAttribute("property", property);
      ogTag.setAttribute("content", content);
      document.head.appendChild(ogTag);
    }
  };

  updateOrCreateOGTag("og:title", title);
  updateOrCreateOGTag("og:description", description);
  updateOrCreateOGTag("og:url", window.location.href);

  // Update Twitter meta tags
  updateOrCreateOGTag("twitter:title", title);
  updateOrCreateOGTag("twitter:description", description);
};

// Debounced function to prevent excessive URL updates
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
