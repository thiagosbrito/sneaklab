export default function TrendsChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Today's trends</h3>
          <p className="text-sm text-gray-500">30 Sept 2021</p>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-gray-600">Yesterday</span>
          </div>
        </div>
      </div>

      <div className="h-64 relative">
        {/* Simple SVG Chart */}
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Today's line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            points="50,150 100,80 200,120 300,90 350,130"
          />
          
          {/* Yesterday's line */}
          <polyline
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="2"
            points="50,160 100,100 200,140 300,110 350,150"
          />
          
          {/* Data points for today */}
          <circle cx="50" cy="150" r="4" fill="#3B82F6" />
          <circle cx="100" cy="80" r="4" fill="#3B82F6" />
          <circle cx="200" cy="120" r="4" fill="#3B82F6" />
          <circle cx="300" cy="90" r="4" fill="#3B82F6" />
          <circle cx="350" cy="130" r="4" fill="#3B82F6" />
          
          {/* Value labels */}
          <text x="300" y="85" className="text-xs fill-gray-600">38</text>
        </svg>
      </div>
    </div>
  )
}
