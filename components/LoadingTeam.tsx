"use client";

export default function LoadingTeam() {
  return (
    <div className="h-screen flex flex-col px-2 text-white font-sans">
      <div className="bg-black rounded p-4 mb-2">
        <div className="h-6 bg-gray-700 rounded animate-pulse mb-4 w-20"></div>
        
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
          <div>
            <div className="h-6 bg-gray-700 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded animate-pulse w-48"></div>
          </div>
        </div>
      </div>

      <div className="bg-[#222222] border border-transparent rounded-2xl p-4 flex-1">
        <div className="h-full flex flex-col space-y-4">
          {/* Loading tabs */}
          <div className="flex space-x-4 mb-4">
            <div className="h-8 bg-gray-700 rounded animate-pulse w-20"></div>
            <div className="h-8 bg-gray-600 rounded animate-pulse w-24"></div>
          </div>

          {/* Loading stats */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="h-6 bg-gray-600 rounded animate-pulse w-48 mb-4"></div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="h-8 bg-gray-600 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-600 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-600 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading matches */}
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-700 rounded animate-pulse w-40 mb-4"></div>
            
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#181c23] rounded-lg border border-[#2a2e39] p-4">
                <div className="h-5 bg-gray-600 rounded animate-pulse w-40 mb-3"></div>
                
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between py-2 mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-gray-600 rounded animate-pulse w-24"></div>
                    </div>
                    <div className="h-4 bg-gray-600 rounded animate-pulse w-16"></div>
                    <div className="flex items-center space-x-3">
                      <div className="h-4 bg-gray-600 rounded animate-pulse w-24"></div>
                      <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}