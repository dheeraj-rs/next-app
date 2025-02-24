import Link from 'next/link';

export default function Home() {
  const previewLinks = [
    {
      href: '/urlpdfpreview',
      title: 'PDF Preview',
      description: 'View and analyze PDF documents online',
      gradient: 'from-blue-500 to-blue-700',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-800',
    },
    {
      href: '/urlpdfpreview',
      title: 'Image Preview',
      description: 'Browse and inspect image files',
      gradient: 'from-emerald-500 to-emerald-700',
      hoverGradient: 'hover:from-emerald-600 hover:to-emerald-800',
    },
    {
      href: '/urlpdfpreview',
      title: 'Video Preview',
      description: 'Stream and preview video content',
      gradient: 'from-purple-500 to-purple-700',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-800',
    },
    {
      href: '/urlpdfpreview',
      title: 'CSV Preview',
      description: 'Examine and analyze CSV data files',
      gradient: 'from-orange-500 to-orange-700',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-800',
    },
    {
      href: '/urlpdfpreview',
      title: 'JSON Preview',
      description: 'Inspect and validate JSON structures',
      gradient: 'from-rose-500 to-rose-700',
      hoverGradient: 'hover:from-rose-600 hover:to-rose-800',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 md:py-16 lg:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Universal File Preview
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto">
            Preview and analyze multiple file formats instantly in your browser
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full bg-gray-50 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={`
                  group relative overflow-hidden
                  rounded-2xl shadow-lg
                  p-6 md:p-8
                  bg-gradient-to-br ${link.gradient}
                  transition-all duration-300 transform
                  hover:scale-[1.02] ${link.hoverGradient}
                  flex flex-col
                `}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {link.title}
                  </h2>
                  <p className="text-gray-100 text-sm md:text-base flex-grow">
                    {link.description}
                  </p>
                  <div className="mt-6 inline-flex items-center text-white">
                    <span className="font-medium">Get Started</span>
                    <svg
                      className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Decorative circle */}
                <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/10 rounded-full" />
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm md:text-base">
            Preview files securely and efficiently in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}
