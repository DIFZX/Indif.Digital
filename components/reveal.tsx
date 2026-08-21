"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealDirection = "up" | "left" | "right" | "scale";

export function Reveal({ children, direction = "up", delay = 0, className = "" }: { children: ReactNode; direction?: RevealDirection; delay?: number; className?: string }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const scrollDirectionRef = useRef<"up" | "down">("down");
  const lastScrollYRef = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    lastScrollYRef.current = window.scrollY;
    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollYRef.current) > 2) {
        scrollDirectionRef.current = currentScrollY > lastScrollYRef.current ? "down" : "up";
        lastScrollYRef.current = currentScrollY;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        return;
      }

      if (scrollDirectionRef.current === "up") {
        setVisible(false);
      }
    }, { threshold: 0.08, rootMargin: "-6% 0px -6% 0px" });

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    observer.observe(element);
    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
      observer.disconnect();
    };
  }, []);

  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;
  return <div ref={elementRef} className={`reveal reveal-${direction} ${visible ? "is-visible" : ""} ${className}`} style={style}>{children}</div>;
}
