import { useEffect, useState } from "react";

/**
 * Custom hook to handle scroll reveal animations and track scroll progress
 */
export function useScrollReveal() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // 1. Observe all elements with .reveal-on-scroll or .reveal-popup
    const selector = ".reveal-on-scroll, .reveal-popup";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            // Unobserve once revealed to keep performance crisp
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const observeAll = () => {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.classList.contains("revealed")) {
          observer.observe(el);
        }
      });
    };

    observeAll();

    // Re-scan whenever DOM mutations occur (e.g. data reloaded from API)
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // 2. Track scroll progress, Back to Top visibility & dynamic footer clearance
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
      setShowBackToTop(window.scrollY > 420);

      // Keep Back to Top button cleanly spaced 24px above the footer when scrolled to the bottom
      const footerEl = document.querySelector("footer.footer");
      if (footerEl) {
        const footerRect = footerEl.getBoundingClientRect();
        const overlap = Math.max(0, window.innerHeight - footerRect.top);
        const clearance = overlap > 0 ? overlap + 24 : 28;
        document.documentElement.style.setProperty("--back-to-top-bottom", `${clearance}px`);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { scrollProgress, showBackToTop, scrollToTop };
}
