// INSTRUCTIONS SECTION: Step-by-step guide for users
// This component displays clear instructions on how to use the website
// Positioned between the hero section and AI recommendations for optimal UX flow

export const InstructionsSection = () => {
  const steps = [
    {
      number: 1,
      title: "Rate Movies",
      description:
        "Rate at least 3 movies you've watched to help us understand your taste.",
      icon: "⭐",
      color: "from-yellow-500 to-orange-500",
    },
    {
      number: 2,
      title: "Add to Watchlist",
      description:
        "Add movies you want to watch to your watchlist (optional but helpful).",
      icon: "💝",
      color: "from-red-500 to-pink-500",
    },
    {
      number: 3,
      title: "Get Recommendations",
      description:
        "Click 'Generate Recommendations' to get personalized AI suggestions.",
      icon: "🤖",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Follow these simple steps to get personalized movie recommendations!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative text-center group">
            {/* Step Icon */}
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step.color} text-white text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}
            >
              {step.icon}
            </div>

            {/* Step Content with Number */}
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-3">
              {step.number}. {step.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {step.description}
            </p>

            {/* Connecting Arrow (except for last step) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-full w-full transform -translate-y-1/2 z-0">
                <div className="flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-slate-300 dark:text-slate-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Progress Indicator */}
      <div className="md:hidden flex justify-center mt-6">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
