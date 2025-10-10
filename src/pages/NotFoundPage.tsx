import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Design system colors
const COLORS = {
  desktopBackground: "#fff47b", // Primary yellow background
  desktopDecoration: "#2a323f", // Dark gray for decorative elements
  mobileBackground: "#2a323f", // Dark gray for background
  mobileDecoration: "#fff47b", // Primary yellow for decorative elements
  text: "#fafafa",       // Light text color
};

export const Desktop = () => {
  return (
    <main className="hidden md:grid min-h-full w-full place-items-start justify-left overflow-hidden" style={{ backgroundColor: COLORS.desktopBackground }}>
      <section className="flex h-full w-full items-start" style={{ backgroundColor: COLORS.desktopBackground }}>
        {/* Left side content */}
        <div className="relative h-full w-[744px] flex-shrink-0 p-16">
          {/* Decorative corner elements that remain absolutely positioned */}
          <div className="absolute left-0 bottom-107 flex items-start bg-[#2a323f]">
            <div className="h-[128px] w-[144px] rounded-bl-[60px]" style={{ backgroundColor: COLORS.desktopBackground }} />
          </div>
          <div className="absolute left-0 bottom-0 h-[429px] w-[600px] rounded-tr-[100px] bg-[#2a323f]" />
          <div className="absolute right-0 bottom-0 flex items-end justify-end bg-[#2a323f]">
            <div className="m-0 h-[128px] w-[144px] rounded-bl-[60px]" style={{ backgroundColor: COLORS.desktopBackground }} />
          </div>

          {/* Flexbox-based content layout */}
          <div className="relative flex h-full flex-col">
            {/* Top group: 404 and error - centered in upper portion */}
            <div className="flex flex-1 flex-col items-start justify-center" style={{ paddingBottom: '429px' }}>
              <h1 className="font-bold text-[160px] leading-none tracking-tight text-[#2a323f] text-shadow-lg">404</h1>
              <h2 className="font-bold text-[60px] leading-none text-[#2a323f] text-shadow-lg">error</h2>
            </div>

            {/* Bottom group: Message and button - positioned at bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-8 pb-0">
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

export const Mobile = () => {
  return (
    <main className="flex md:hidden h-full w-full flex-col overflow-hidden" style={{ backgroundColor: COLORS.mobileDecoration }}>
      {/* Dark gray box at top with rounded bottom edges */}
      <section 
        className="relative flex flex-col items-center rounded-b-[40px] px-6 py-12" 
        style={{ backgroundColor: COLORS.mobileBackground }}
      >
        {/* Circular Hippo Image at top */}
        <div className="mb-8">
          <img 
            src="/half_shocked_hippo.png" 
            alt="Shocked hippo" 
            className="h-32 w-32 rounded-full object-cover scale-x-[-1]"
          />
        </div>
        
        {/* 404 heading */}
        <h1 className="font-bold text-[100px] leading-none tracking-tight text-[#fff47b] text-shadow-lg">
          404
        </h1>
        
        {/* error subheading */}
        <h2 className="mb-8 font-bold text-[40px] leading-none text-[#fff47b] text-shadow-lg">
          error
        </h2>
      </section>

      {/* Yellow background section */}
      <section 
        className="flex flex-1 flex-col justify-end px-12 pb-36 pt-8" 
        style={{ backgroundColor: COLORS.mobileDecoration }}
      >
        {/* Oops! text - left justified but moved right a bit */}
        <p className="mb-8 ml-4 font-bold text-2xl leading-normal tracking-tight text-[#2a323f] text-shadow-lg">
          Oops! Looks like this page went on a little adventure. While we
          try to wrangle it back, want to go home?
        </p>
        
        {/* Home button extending out of the right side */}
        <Link 
          to="/" 
          aria-label="Home navigation"
          className={cn(
            buttonVariants({ size: "lg", variant: null }),
            "mr-[-20px] h-14 bg-[#2a323f] text-[#fff47b] hover:bg-[#2a323f] hover:scale-105 transition-all font-bold text-2xl rounded-l-[60px] rounded-r-[60px]"
          )}
        >
          Home
        </Link>
      </section>
    </main>
  );
};

// Default export with responsive behavior
export default function NotFoundPage() {
  return (
    <>
      <Desktop />
      <Mobile />
    </>
  );
}
