import Image from "next/image"

export default function Showcase() {
  return (
    <section className="w-full bg-gradient-to-r from-purple-400 to-purple-600 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Discover the Hottest Sneaker Brands in Streetwear Fashion
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Step into style with our curated collection of top sneaker brands.
                Elevate your streetwear game with the latest releases.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Top Brands</h3>
                <p className="opacity-90">
                  Featuring Nike, Adidas, Puma, and more to keep your sneaker game strong.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Shop Now</h3>
                <p className="opacity-90">
                  Find your perfect pair and express your unique style today.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Content - Image Placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md aspect-square flex items-center justify-center">
              <div className="bg-gray-400 rounded-2xl w-32 h-24 flex items-center justify-center">
                <div className="text-gray-600">
                  <svg 
                    className="w-8 h-8" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}