export default function NewsColumn({ title, headlines, isGlobal = false }) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-light tracking-wide text-gray-200/90 mb-8">{title}</h2>
      <div className="space-y-6 flex-grow">
        {headlines.map((headline, index) => (
          <article
            key={index}
            className="group bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 transition-all duration-200 hover:bg-gray-800/30"
          >
            {headline.trending && (
              <span className="inline-block bg-gradient-to-r from-amber-500/90 to-amber-400/90 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full tracking-wider mb-3">
                TRENDING
              </span>
            )}
            <h3 className="text-gray-100 font-medium text-lg leading-snug mb-3 group-hover:text-white transition-colors">
              {headline.title}
            </h3>
            <div className="flex items-center text-sm">
              <span className="text-gray-400 font-medium">{headline.source}</span>
              <span className="mx-2 text-gray-600">•</span>
              <span className="text-gray-500">{headline.time}</span>
            </div>
          </article>
        ))}
      </div>
      {isGlobal && (
        <button className="mt-8 w-full py-3.5 bg-gray-800/40 hover:bg-gray-700/50 rounded-2xl text-gray-300 transition-all duration-200 text-sm font-medium backdrop-blur-sm border border-gray-700/20">
          View More Headlines
        </button>
      )}
    </div>
  )
} 