import * as React from "react";

interface StackedCarouselProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  visibleCount?: number;
  gap?: number;
  autoAdvanceMs?: number;
}

export function StackedCarousel<T>({
  items,
  renderCard,
  visibleCount = 3,
  gap = 18,
  autoAdvanceMs = 5000,
}: StackedCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const intervalRef = React.useRef<number | null>(null);

  const stopAutoAdvance = React.useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoAdvance = React.useCallback(() => {
    stopAutoAdvance();
    if (items.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % items.length);
      }, autoAdvanceMs);
    }
  }, [items.length, autoAdvanceMs, stopAutoAdvance]);

  React.useEffect(() => {
    startAutoAdvance();
    return () => stopAutoAdvance();
  }, [startAutoAdvance, stopAutoAdvance]);

  if (items.length === 0) {
    return null;
  }

  const handlePrev = () => {
    stopAutoAdvance();
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    startAutoAdvance();
  };

  const handleNext = () => {
    stopAutoAdvance();
    setActiveIndex((prev) => (prev + 1) % items.length);
    startAutoAdvance();
  };

  const stack = Array.from({ length: Math.min(visibleCount, items.length) }, (_, stackIdx) => {
    const itemIndex = (activeIndex + stackIdx) % items.length;
    return { item: items[itemIndex], stackIdx, itemIndex };
  });

  return (
    <div
      className="relative w-full"
      onMouseEnter={stopAutoAdvance}
      onMouseLeave={startAutoAdvance}
    >
      <div className="relative flex h-[320px] w-full items-center justify-center">
        {stack.map(({ item, stackIdx, itemIndex }) => {
          const depth = visibleCount - stackIdx - 1;
          const scale = 1 - depth * 0.08;
          const translateY = depth * gap;
          const opacity = depth === 0 ? 1 : 0.65 - depth * 0.1;

          return (
            <div
              key={`${itemIndex}-${stackIdx}`}
              className="absolute w-full transition-all duration-500 ease-out"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                zIndex: visibleCount - depth,
                opacity,
              }}
            >
              {renderCard(item, itemIndex)}
            </div>
          );
        })}
      </div>
      {items.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-4">
          <button
            type="button"
            aria-label="Previous"
            onClick={handlePrev}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:border-primary-yellow/60 hover:text-primary-yellow"
          >
            ‹
          </button>
          <div className="pointer-events-auto flex gap-1">
            {items.map((item, idx) => {
              let indicatorKey = `pos-${idx}`;
              if (item && typeof item === "object" && "id" in (item as Record<string, unknown>)) {
                const value = (item as Record<string, unknown>).id;
                if (typeof value === "string" && value.trim().length > 0) {
                  indicatorKey = value;
                }
              }
              return (
                <span
                  key={indicatorKey}
                  className={`h-1.5 w-6 rounded-full transition ${
                    idx === activeIndex ? "bg-primary-yellow" : "bg-white/20"
                  }`}
                />
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Next"
            onClick={handleNext}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:border-primary-yellow/60 hover:text-primary-yellow"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
