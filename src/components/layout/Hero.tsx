import Image from "next/image";

// HERO SECTION: Pure static content for SSG
// This component is now completely static with no interactive elements
// Perfect for static site generation and optimal caching
export const Hero = () => (
  <div className="relative text-center py-36 lg:py-64 overflow-hidden">
    {/* Background Image */}
    <div className="absolute inset-0">
      <Image
        src="/movie-background-collage.jpg"
        alt="Movie background"
        fill
        className="object-cover"
        priority
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/70"></div>
    </div>

    {/* Content */}
    <div className="relative z-10">
      <div className="flex justify-center items-center mb-6">
        <Image
          src="/reel-matchmaker-icon.png"
          alt="Reel Matchmaker"
          width={100}
          height={100}
        />
        <h1 className="ml-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
          Reel Matchmaker
        </h1>
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
        Discover Your Next Favorite Movie
      </h1>
      <p className="text-xl text-slate-200 max-w-4xl mx-auto">
        Rate movies you enjoy and get personalized AI recommendations based on
        your taste.
      </p>
    </div>
  </div>
);
