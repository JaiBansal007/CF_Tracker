import { useEffect, useState } from 'react';
import { LuArrowRight, LuExternalLink, LuLightbulb, LuShuffle } from 'react-icons/lu';
import { codeforcesAPI } from '../services/codeforcesApi';

const ratings = Array.from({ length: 28 }, (_, index) => 800 + index * 100);

const fetchProblem = (rating, excludeIds = []) => codeforcesAPI.getRandomMindSolveProblem({
  rating: rating ? Number(rating) : undefined,
  excludeIds,
});

export default function MindSolve() {
  const [rating, setRating] = useState('');
  const [problem, setProblem] = useState(null);
  const [seenProblemIds, setSeenProblemIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProblem = async (excludeIds = []) => {
    setLoading(true);
    setError('');
    try {
      const nextProblem = await fetchProblem(rating, excludeIds);
      setProblem(nextProblem);
    } catch (loadError) {
      setError(loadError.message || 'Could not find a problem right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchProblem(rating).then(nextProblem => {
      if (!cancelled) setProblem(nextProblem);
    }).catch(loadError => {
      if (!cancelled) setError(loadError.message || 'Could not find a problem right now. Please try again.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [rating]);

  const skipProblem = () => {
    const currentId = problem ? `${problem.contestId}${problem.index}` : null;
    const excluded = currentId ? [...seenProblemIds, currentId] : seenProblemIds;
    setSeenProblemIds(excluded);
    loadProblem(excluded);
  };

  const problemUrl = problem?.source === 'gym'
    ? `https://codeforces.com/gym/${problem.contestId}/problem/${problem.index}`
    : problem ? codeforcesAPI.getProblemUrl(problem.contestId, problem.index) : '';
  const editorialSearchUrl = problem
    ? `https://www.google.com/search?q=${encodeURIComponent(`site:codeforces.com/blog/entry ${problem.contestName || problem.contestId} editorial`)}`
    : '';

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <LuLightbulb size={15} />
            No code, just ideas
          </p>
          <h1 className="text-3xl font-semibold text-white">Mind Solve</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
            Pick a problem, think it through, and move on whenever you are ready.
          </p>
        </div>

        <label className="flex shrink-0 flex-col gap-1.5 text-xs text-gray-400">
          Problem rating
          <select
            value={rating}
            onChange={event => {
              setRating(event.target.value);
              setProblem(null);
              setSeenProblemIds([]);
              setError('');
              setLoading(true);
            }}
            className="h-10 min-w-40 rounded-md border border-white/10 bg-[#101312] px-3 text-sm text-gray-100 outline-none focus:border-emerald-400/60"
          >
            <option value="">Any rating</option>
            {ratings.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </header>

      <div className="overflow-hidden border border-white/10 bg-[#0b0e0d]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs text-gray-500 sm:px-7">
          <span>Random Codeforces problem</span>
          {problem && <span>{problem.source === 'gym' ? 'Gym' : 'Problemset'}</span>}
        </div>

        <div className="min-h-72 px-5 py-8 sm:px-10 sm:py-10">
          {loading ? (
            <div className="flex min-h-52 items-center justify-center text-sm text-gray-400" role="status">
              Finding a problem...
            </div>
          ) : error ? (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <p className="max-w-md text-sm leading-6 text-rose-300">{error}</p>
              <button onClick={() => loadProblem(seenProblemIds)} className="mt-5 text-sm text-white underline underline-offset-4">
                Try again
              </button>
            </div>
          ) : problem && (
            <>
              <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>#{problem.contestId}{problem.index}</span>
                {problem.rating && <span className="border-l border-white/15 pl-2">Rating {problem.rating}</span>}
                {problem.contestName && <span className="border-l border-white/15 pl-2">{problem.contestName}</span>}
              </div>
              <h2 className="max-w-3xl text-2xl font-medium leading-snug text-white sm:text-3xl">
                {problem.name}
              </h2>

              {problem.tags?.length > 0 && (
                <details className="mt-7 text-sm text-gray-400">
                  <summary className="w-fit cursor-pointer select-none hover:text-gray-200">Show tags</summary>
                  <p className="mt-3 flex flex-wrap gap-2">
                    {problem.tags.map(tag => (
                      <span key={tag} className="border border-white/10 px-2 py-1 text-xs text-gray-400">{tag}</span>
                    ))}
                  </p>
                </details>
              )}
            </>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <a
            href={problemUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!problem || loading}
            className={`inline-flex h-10 items-center justify-center gap-2 border border-white/15 px-4 text-sm text-gray-200 transition-colors hover:bg-white/5 ${!problem || loading ? 'pointer-events-none opacity-40' : ''}`}
          >
            Open statement <LuExternalLink size={14} />
          </a>
          <div className="flex flex-wrap gap-3">
            <a
              href={editorialSearchUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!problem || loading}
              className={`inline-flex h-10 items-center justify-center gap-2 px-3 text-sm text-gray-400 transition-colors hover:text-white ${!problem || loading ? 'pointer-events-none opacity-40' : ''}`}
            >
              Find editorial <LuExternalLink size={14} />
            </a>
            <button
              onClick={skipProblem}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 bg-emerald-300 px-4 text-sm font-semibold text-[#07100c] transition-colors hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-50"
            >
              Skip problem <LuShuffle size={14} /> <LuArrowRight size={14} />
            </button>
          </div>
        </footer>
      </div>
      <p className="mt-3 text-xs leading-5 text-gray-600">
        Editorial availability varies; search results are limited to Codeforces blogs. Statements open on Codeforces.
      </p>
    </section>
  );
}