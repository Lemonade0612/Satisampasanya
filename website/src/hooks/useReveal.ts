import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fades up every [data-reveal] element as it scrolls into view.
 * Elements inside the same parent are staggered one after another.
 */
export function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const siblings = Array.from(el.parentElement?.querySelectorAll(":scope > [data-reveal]") ?? []);
          el.style.setProperty("--i", String(Math.max(0, siblings.indexOf(el))));
          el.classList.add("is-in");
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
}
