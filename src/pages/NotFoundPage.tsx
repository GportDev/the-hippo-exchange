import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Design system colors
const COLORS = {
  background: "#fff47b", // Primary yellow background
  decoration: "#2a323f", // Dark gray for decorative elements
  text: "#fafafa",       // Light text color
};

export const Desktop = () => {
  return (
    <main className="grid min-h-full w-full place-items-start justify-left overflow-hidden" style={{ backgroundColor: COLORS.background }}>
      <section className="flex h-full w-full items-start" style={{ backgroundColor: COLORS.background }}>
        {/* Left side content */}
        <div className="relative h-full w-[744px] flex-shrink-0 p-16">
          {/* Decorative corner elements that remain absolutely positioned */}
          <div className="absolute left-0 bottom-107 flex items-start bg-[#2a323f]">
            <div className="h-[128px] w-[144px] rounded-bl-[60px]" style={{ backgroundColor: COLORS.background }} />
          </div>
          <div className="absolute left-0 bottom-0 h-[429px] w-[600px] rounded-tr-[100px] bg-[#2a323f]" />
          <div className="absolute right-0 bottom-0 flex items-end justify-end bg-[#2a323f]">
            <div className="m-0 h-[128px] w-[144px] rounded-bl-[60px]" style={{ backgroundColor: COLORS.background }} />
          </div>

          {/* Flexbox-based content layout */}
          <div className="relative flex h-full flex-col justify-between">
            {/* Top group: 404 and error */}
            <div className="m-0 flex flex-col">
              <h1 className="font-bold text-[160px] leading-none tracking-tight text-[#2a323f] text-shadow-lg">404</h1>
              <h2 className="font-bold text-[60px] leading-none text-[#2a323f] text-shadow-lg">error</h2>
            </div>

            {/* Bottom group: Message and button */}
            <div className="flex flex-col gap-8">
              <p className="m-0 w-120 font-bold text-4xl leading-normal tracking-tight text-[#fafafa] text-shadow-lg">
                Oops! Looks like this page went on a little adventure. While we
                try to wrangle it back, want to go home?
              </p>
              <Link 
                to="/" 
                aria-label="Home navigation"
                className={cn(
                  buttonVariants({ size: "lg", variant: null }),
                  "w-full max-w-md h-15 bg-[#fff47b] text-[#2a323f] hover:bg-[#fff47b] hover:scale-105 transition-all font-bold text-3xl rounded-[60px]"
                )}
              >
                Home
              </Link>
            </div>
          </div>
        </div>

        {/* Right side content (Hippo) */}
        <div className="relative h-full flex-1">
          <img src="/full-shocked-hippo-2-3.png" alt="Shocked hippo" className="absolute inset-0 h-full w-full object-contain scale-x-[-1]" />
        </div>
      </section>
    </main>
  );
};
