import React, { useState, useEffect } from 'react';
import { codeforcesAPI } from '../services/codeforcesApi';
import { LuSearch, LuActivity } from 'react-icons/lu';

const getRatingColor = (r) => {
  if (!r)       return '#6b7280';
  if (r < 1200) return '#9ca3af';
  if (r < 1400) return '#4ade80';
  if (r < 1600) return '#22d3ee';
  if (r < 1900) return '#60a5fa';
  if (r < 2100) return '#c084fc';
  if (r < 2400) return '#fbbf24';
  if (r < 2600) return '#fb923c';
  if (r < 3000) return '#f87171';
  return '#dc2626';
};

export default function CFStats({ darkMode, initialHandle }) {
  const [handle, setHandle] = useState(initialHandle || '');
  const [searchHandle, setSearchHandle] = useState(initialHandle || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all problems
        const allProblems = await codeforcesAPI.fetchAllProblems();
        const problemsByRating = {};
        
        allProblems.forEach(p => {
          if (p.rating) {
            const r = Math.floor(p.rating / 100) * 100;
            problemsByRating[r] = (problemsByRating[r] || 0) + 1;
          }
        });

        // Fetch user submissions if handle is provided
        const solvedByRating = {};
        if (searchHandle) {
          try {
            const submissions = await codeforcesAPI.fetchUserSubmissions(searchHandle);
            const acProblems = {};
            submissions.forEach(s => {
              if (s.verdict === 'OK' && s.problem.rating) {
                const key = `${s.problem.contestId}${s.problem.index}`;
                if (!acProblems[key]) {
                  acProblems[key] = true;
                  const r = Math.floor(s.problem.rating / 100) * 100;
                  solvedByRating[r] = (solvedByRating[r] || 0) + 1;
                }
              }
            });
          } catch (e) {
            // If user not found or error, just show 0 solved but don't crash
            console.error("Could not fetch user submissions:", e);
          }
        }

        // Combine stats
        const combinedStats = Object.keys(problemsByRating)
          .map(Number)
          .sort((a, b) => a - b)
          .map(r => ({
            rating: r,
            total: problemsByRating[r],
            solved: solvedByRating[r] || 0,
            color: getRatingColor(r)
          }));

        setStats(combinedStats);
      } catch (err) {
        setError(err.message || "Failed to load Codeforces stats");
      }
      setLoading(false);
    };

    fetchStats();
  }, [searchHandle]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchHandle(handle);
  };

  const maxTotal = stats.length > 0 ? Math.max(...stats.map(s => s.total)) : 1;

  return (
    <div className={`max-w-6xl mx-auto ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="flex flex-col gap-6">
        
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#0d0d0d] border-[#1f1f1f]' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <LuActivity className="text-violet-500" />
                Codeforces Problem Distribution
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total problems available vs solved for each rating
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <LuSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Enter CF handle (optional)"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm transition-colors ${
                    darkMode 
                      ? 'bg-black border-gray-800 focus:border-violet-500 text-white placeholder:text-gray-600'
                      : 'bg-gray-50 border-gray-200 focus:border-violet-500 text-gray-900'
                  } focus:outline-none`}
                />
              </div>
              <button 
                type="submit"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
              >
                Apply
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-800 border-t-violet-500 mb-4" />
              <span className="text-gray-500">Crunching Codeforces data...</span>
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-400 bg-red-950/20 rounded-xl border border-red-900/40">
              {error}
            </div>
          ) : (
            <div className="w-full overflow-x-auto pb-4">
              <div className="min-w-[800px] flex items-end gap-1.5 h-[300px] pt-10">
                {stats.map((item) => {
                  const totalPct = (item.total / maxTotal) * 100;
                  const solvedPct = item.total > 0 ? (item.solved / item.total) * 100 : 0;
                  
                  return (
                    <div key={item.rating} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-16 bg-gray-900 text-white text-[11px] p-2 rounded-lg pointer-events-none whitespace-nowrap z-10 border border-gray-700 shadow-xl">
                        <div className="font-bold mb-1" style={{ color: item.color }}>Rating: {item.rating}</div>
                        <div>Total: <span className="font-medium">{item.total}</span></div>
                        {searchHandle && (
                          <div>Solved: <span className="font-medium text-green-400">{item.solved}</span></div>
                        )}
                      </div>

                      {/* Bar Container */}
                      <div className="w-full relative rounded-t-sm flex flex-col justify-end transition-all duration-300 bg-gray-800/40"
                           style={{ height: `${Math.max(totalPct, 1)}%` }}>
                        
                        {/* Background total bar */}
                        <div className="absolute inset-0 rounded-t-sm opacity-20" style={{ backgroundColor: item.color }}></div>
                        
                        {/* Solved foreground bar */}
                        {searchHandle && (
                          <div className="w-full rounded-t-sm transition-all duration-500 relative z-10"
                               style={{ height: `${Math.max(solvedPct, 0)}%`, backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }}>
                            {/* Texture/pattern to distinguish solved part */}
                            <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PHBhdGggZD0iTTAgNEw0IDBaTTQgMEwwIDRaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* X-axis Label */}
                      <div className="text-[10px] font-medium rotate-45 origin-left translate-y-2 translate-x-2" style={{ color: item.color }}>
                        {item.rating}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
