import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fades up every [data-reveal] element as it scrolls into view.
 * Elements inside the same parent are staggered one after another.
 * Reveal state is stored in a `data-in` attribute (not a class) so React
 * re-renders can never wipe it.
 */
export function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pending = new Set(Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")));
    if (!("IntersectionObserver" in window)) {
      pending.forEach((el) => el.setAttribute("data-in", ""));
      return;
    }

    const reveal = (el: HTMLElement) => {
      const siblings = Array.from(el.parentElement?.querySelectorAll(":scope > [data-reveal]") ?? []);
      el.style.setProperty("--i", String(Math.max(0, siblings.indexOf(el))));
      el.setAttribute("data-in", "");
      pending.delete(el);
      io.unobserve(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    pending.forEach((el) => io.observe(el));

    // The observer only fires when visibility changes, so a jump straight past
    // an element (anchor link, End key, fast scroll) would leave it hidden.
    // Show anything that is now entirely above the viewport.
    let queued = false;
    const sweep = () => {
      queued = false;
      pending.forEach((el) => {
        if (el.getBoundingClientRect().bottom < 0) reveal(el);
      });
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(sweep);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    sweep();

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [pathname]);
}
