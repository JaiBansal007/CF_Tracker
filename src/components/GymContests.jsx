import { useEffect, useMemo, useState } from 'react';
import { codeforcesAPI } from '../services/codeforcesApi';
import { storage } from '../services/firebaseStorage';

const PAGE_SIZE = 10;

export default function GymContests({ cfHandle }) {
  const [contests, setContests] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [savingContestId, setSavingContestId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadContests = async () => {
      setLoading(true);
      setError('');

      try {
        const [submissions, gymContests, savedStatuses] = await Promise.all([
          codeforcesAPI.fetchUserSubmissions(cfHandle),
          codeforcesAPI.getGymContests(),
          storage.getGymContestStatuses(cfHandle),
        ]);
        if (!active) return;

        const submittedContestIds = new Set(
          submissions
            .map(submission => submission.problem?.contestId)
            .filter(contestId => Number.isInteger(contestId) && contestId >= 100000)
        );
        const matchingContests = gymContests
          .filter(contest => submittedContestIds.has(contest.id))
          .sort((a, b) =>
            (b.startTimeSeconds || 0) - (a.startTimeSeconds || 0) ||
            Number(b.id) - Number(a.id)
          );

        setContests(matchingContests);
        setStatuses(savedStatuses);
        setVisibleCount(PAGE_SIZE);
      } catch (loadError) {
        console.error('Error loading Gym contests:', loadError);
        if (active) setError('Could not load Gym contests. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (!cfHandle) return () => { active = false; };

    loadContests();

    return () => {
      active = false;
    };
  }, [cfHandle, refreshKey]);

  const visibleContests = useMemo(
    () => contests.slice(0, visibleCount),
    [contests, visibleCount]
  );
  const solvedCount = contests.filter(contest => statuses[contest.id]).length;

  const toggleSolved = async (contest) => {
    const solved = !statuses[contest.id];
    setSavingContestId(contest.id);
    setError('');

    try {
      await storage.setGymContestSolved(contest.id, solved, cfHandle);
      setStatuses(current => ({ ...current, [contest.id]: solved }));
    } catch (saveError) {
      console.error('Error updating Gym contest status:', saveError);
      setError('Could not save this status. Please try again.');
    } finally {
      setSavingContestId(null);
    }
  };

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Contest tracker</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Gym contests</h1>
          <p className="mt-2 text-sm text-gray-400">
            Finished Gym contests with submissions from <span className="font-medium text-gray-200">{cfHandle}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Contests start as Pending. Click Mark solved when you finish; your choice is saved on this website.
          </p>
          </div>
        <button
          type="button"
          onClick={() => setRefreshKey(key => key + 1)}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          {loading ? 'Loading…' : '↻ Refresh contests'}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-300" role="alert">
          {error}
        </div>
      )}

      {!loading && contests.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-gray-300">
            {contests.length} contests
          </span>
          <span className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 px-3 py-2 text-emerald-300">
            {solvedCount} solved
          </span>
          <span className="rounded-lg border border-amber-800/40 bg-amber-950/30 px-3 py-2 text-amber-300">
            {contests.length - solvedCount} pending
          </span>
        </div>
      )}

      {!cfHandle ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-lg font-semibold text-gray-200">Set up your Codeforces handle</p>
          <p className="mt-2 text-sm text-gray-500">A handle is needed to find your Gym submissions.</p>
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center text-gray-400">
          Loading your Gym contests…
        </div>
      ) : contests.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-lg font-semibold text-gray-200">
            {error ? 'Could not load Gym contests' : 'No Gym submissions found'}
          </p>
          {!error && (
            <p className="mt-2 text-sm text-gray-500">
              Finished Gym contests will appear here when {cfHandle} has submitted to them.
            </p>
          )}
          {error && (
            <button
              type="button"
              onClick={() => setRefreshKey(key => key + 1)}
              className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {visibleContests.map(contest => {
              const solved = Boolean(statuses[contest.id]);
              return (
                <article
                  key={contest.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#111018] to-[#0c0c10] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <a
                      href={`https://codeforces.com/gym/${contest.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-100 transition hover:text-violet-300"
                    >
                      {contest.name || `Gym ${contest.id}`}
                      <span className="ml-2 text-xs font-normal text-gray-500">#{contest.id} ↗</span>
                    </a>
                    <p className="mt-1 text-xs text-gray-500">
                      {contest.startTimeSeconds
                        ? new Date(contest.startTimeSeconds * 1000).toLocaleDateString()
                        : 'Finished contest'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`text-xs font-semibold ${solved ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {solved ? 'Solved' : 'Pending'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSolved(contest)}
                      disabled={savingContestId === contest.id}
                      aria-label={`Mark ${contest.name || `Gym ${contest.id}`} as ${solved ? 'pending' : 'solved'}`}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                        solved
                          ? 'border-emerald-700/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70'
                          : 'border-amber-700/50 bg-amber-950/30 text-amber-300 hover:bg-amber-950/60'
                      }`}
                    >
                      {savingContestId === contest.id ? 'Saving…' : solved ? 'Mark pending' : 'Mark solved'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500">
              Showing {Math.min(visibleCount, contests.length)} of {contests.length} contests
            </p>
            {visibleCount < contests.length && (
              <button
                type="button"
                onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, contests.length))}
                className="rounded-xl border border-violet-700/40 bg-violet-950/30 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-900/40"
              >
                Load {Math.min(PAGE_SIZE, contests.length - visibleCount)} more
              </button>
            )}
            </div>
        </>
      )}
    </section>
  );
}
