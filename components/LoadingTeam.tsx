"use client";

export default function LoadingTeam() {
  return (
    <div className="flex h-screen flex-col px-2 font-sans text-white">
      <div className="mb-2 rounded bg-black p-4">
        <div className="mb-4 h-6 w-20 animate-pulse rounded bg-gray-700"></div>

        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 animate-pulse rounded-full bg-gray-700"></div>
          <div>
            <div className="mb-2 h-6 w-32 animate-pulse rounded bg-gray-700"></div>
            <div className="h-4 w-48 animate-pulse rounded bg-gray-600"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-transparent bg-[#222222] p-4">
        <div className="flex h-full flex-col space-y-4">
          {/* Loading tabs */}
          <div className="mb-4 flex space-x-4">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-700"></div>
            <div className="h-8 w-24 animate-pulse rounded bg-gray-600"></div>
          </div>

          {/* Loading stats */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-600"></div>

            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="mb-2 h-8 animate-pulse rounded bg-gray-600"></div>
                <div className="h-4 animate-pulse rounded bg-gray-700"></div>
              </div>
              <div className="text-center">
                <div className="mb-2 h-8 animate-pulse rounded bg-gray-600"></div>
                <div className="h-4 animate-pulse rounded bg-gray-700"></div>
              </div>
              <div className="text-center">
                <div className="mb-2 h-8 animate-pulse rounded bg-gray-600"></div>
                <div className="h-4 animate-pulse rounded bg-gray-700"></div>
              </div>
            </div>
          </div>

          {/* Loading matches */}
          <div className="flex-1 space-y-4">
            <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-700"></div>

            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-lg border border-[#2a2e39] bg-[#181c23] p-4"
              >
                <div className="mb-3 h-5 w-40 animate-pulse rounded bg-gray-600"></div>

                {[1, 2, 3].map(j => (
                  <div
                    key={j}
                    className="mb-2 flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 animate-pulse rounded-full bg-gray-600"></div>
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-600"></div>
                    </div>
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-600"></div>
                    <div className="flex items-center space-x-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-600"></div>
                      <div className="h-6 w-6 animate-pulse rounded-full bg-gray-600"></div>
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
