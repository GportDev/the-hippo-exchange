import { Link } from "@tanstack/react-router";

export const Desktop = () => {
  return (
    <main className="grid min-h-screen w-full place-items-start justify-left bg-[#fff47b]">
      <section className="flex h-screen w-full items-start overflow-hidden bg-primary-yellow">
        {/* Left side content */}
        <div className="relative h-full w-[744px] flex-shrink-0 p-16">
          {/* Decorative corner elements that remain absolutely positioned */}
          <div className="absolute left-0 bottom-131 flex items-start bg-[#2a323f]">
            <div className="h-[128px] w-[144px] rounded-bl-[60px] bg-[#fff47b]" />
          </div>
          <div className="absolute left-0 bottom-24 h-[429px] w-[600px] rounded-tr-[100px] bg-[#2a323f]" />
          <div className="absolute right-0 bottom-24 flex items-end justify-end bg-[#2a323f]">
            <div className="m-0 h-[128px] w-[144px] rounded-bl-[60px] bg-[#fff47b]" />
          </div>

          {/* Flexbox-based content layout */}
          <div className="relative flex h-full flex-col justify-between">
            {/* Top group: 404 and error */}
            <div className="m-0 flex flex-col">
              <h1 className="font-bold text-9xl leading-none tracking-tight text-[#2a323f]">404</h1>
              <h2 className="font-bold text-5xl leading-none text-[#2a323f]">error</h2>
            </div>

            {/* Bottom group: Message and button */}
            <div className="flex flex-col gap-8">
              <p className="m-0 w-100 font-bold text-3xl leading-normal tracking-none text-[#fafafa] text-shadow-lg">
                Oops! Looks like this page went on a little adventure. While we
                try to wrangle it back, want to go home?
              </p>
              <Link to="/" className="flex h-50 min-w-[366px] items-start" aria-label="Home navigation">
                <div className="flex h-[109px] min-w-30 cursor-pointer items-center rounded-[60px] border-none bg-[#fff47b]" aria-label="Go to homepage">
                  <span className="flex h-[103px] w-[364px] items-center justify-center text-center font-bold text-[50px] leading-normal tracking-[0] text-[#2a323f]">Home</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right side content (Hippo) */}
        <div className="relative h-full flex-1">
          <img src="/full-shocked-hippo-2-3.png" alt="Shocked hippo" className="absolute inset-0 h-full w-full object-contain" />
        </div>
      </section>
    </main>
  );
};
