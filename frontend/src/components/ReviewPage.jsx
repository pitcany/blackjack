import React, { useEffect, useState } from 'react';
import { getStatsOverview, getSessionHistory, getCommonMistakes, getSessionDetail } from '../lib/api';

export default function ReviewPage() {
    const [stats, setStats] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [mistakes, setMistakes] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, sessionsData, mistakesData] = await Promise.all([
                getStatsOverview(),
                getSessionHistory(20),
                getCommonMistakes(10)
            ]);
            setStats(statsData);
            setSessions(sessionsData.sessions || []);
            setMistakes(mistakesData.mistakes || []);
        } catch (err) {
            console.error("Failed to load review data", err);
        }
        setLoading(false);
    };

    const viewSessionDetail = async (sessionId) => {
        try {
            const detail = await getSessionDetail(sessionId);
            setSelectedSession(detail);
        } catch (err) {
            console.error("Failed to load session detail", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-12">
                <div className="text-neutral-400">Loading statistics...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-emerald-500 mb-6">Review Dashboard</h1>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b border-neutral-700">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                    Overview
                </TabButton>
                <TabButton active={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')}>
                    Sessions
                </TabButton>
                <TabButton active={activeTab === 'mistakes'} onClick={() => setActiveTab('mistakes')}>
                    Common Mistakes
                </TabButton>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Sessions"
                        value={stats?.total_sessions || 0}
                        color="text-blue-400"
                    />
                    <StatCard
                        title="Hands Played"
                        value={stats?.total_hands || 0}
                        color="text-emerald-400"
                    />
                    <StatCard
                        title="Overall Accuracy"
                        value={`${(stats?.overall_accuracy || 0).toFixed(1)}%`}
                        color={stats?.overall_accuracy >= 90 ? "text-green-400" : stats?.overall_accuracy >= 70 ? "text-yellow-400" : "text-red-400"}
                    />
                    <StatCard
                        title="Net Profit"
                        value={`$${(stats?.total_profit || 0).toFixed(0)}`}
                        color={stats?.total_profit >= 0 ? "text-green-400" : "text-red-400"}
                    />
                    <StatCard
                        title="Correct Plays"
                        value={stats?.total_correct || 0}
                        color="text-emerald-400"
                    />
                    <StatCard
                        title="Mistakes"
                        value={stats?.total_mistakes || 0}
                        color="text-red-400"
                    />
                    <StatCard
                        title="Avg Session Accuracy"
                        value={`${(stats?.avg_accuracy || 0).toFixed(1)}%`}
                        color="text-purple-400"
                    />
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <div className="text-neutral-400 text-center py-8">
                            No completed sessions yet. Play some hands to see your history!
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <SessionCard
                                key={session._id}
                                session={session}
                                onViewDetail={() => viewSessionDetail(session._id)}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Mistakes Tab */}
            {activeTab === 'mistakes' && (
                <div className="space-y-4">
                    {mistakes.length === 0 ? (
                        <div className="text-neutral-400 text-center py-8">
                            No mistakes recorded yet. Keep playing to track your progress!
                        </div>
                    ) : (
                        <div className="bg-neutral-800 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-neutral-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-300">Your Hand</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-300">Dealer Shows</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-300">You Played</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-300">Should Play</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-300">Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-700">
                                    {mistakes.map((mistake, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-750">
                                            <td className="px-4 py-3 text-sm text-white font-mono">
                                                {mistake._id.player_cards?.join(', ')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-white font-mono">
                                                {mistake._id.dealer_up}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-red-400">
                                                {mistake._id.action}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-green-400">
                                                {mistake._id.recommended}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-yellow-400 font-bold">
                                                {mistake.count}x
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Session Detail Modal */}
            {selectedSession && (
                <SessionDetailModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                />
            )}
        </div>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 font-medium transition-colors ${
                active
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-200'
            }`}
        >
            {children}
        </button>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <div className="text-sm text-neutral-400 mb-1">{title}</div>
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
        </div>
    );
}

function SessionCard({ session, onViewDetail }) {
    const accuracy = session.accuracy?.toFixed(1) || 0;
    const profit = session.net_profit || 0;

    return (
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700 hover:border-neutral-600 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-sm text-neutral-400">
                        {new Date(session.start_time).toLocaleDateString()} at{' '}
                        {new Date(session.start_time).toLocaleTimeString()}
                    </div>
                    <div className="flex gap-6 mt-2">
                        <div>
                            <span className="text-neutral-400 text-sm">Hands: </span>
                            <span className="text-white font-mono">{session.hands_played}</span>
                        </div>
                        <div>
                            <span className="text-neutral-400 text-sm">Accuracy: </span>
                            <span className={`font-mono ${accuracy >= 90 ? 'text-green-400' : accuracy >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {accuracy}%
                            </span>
                        </div>
                        <div>
                            <span className="text-neutral-400 text-sm">Profit: </span>
                            <span className={`font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${profit.toFixed(0)}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onViewDetail}
                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}

function SessionDetailModal({ session, onClose }) {
    const events = session.hand_events || [];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-emerald-400">Session Details</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white text-2xl">
                        &times;
                    </button>
                </div>

                <div className="p-4 border-b border-neutral-700 grid grid-cols-4 gap-4 bg-neutral-850">
                    <div>
                        <div className="text-xs text-neutral-400">Hands</div>
                        <div className="text-lg font-bold text-white">{session.hands_played}</div>
                    </div>
                    <div>
                        <div className="text-xs text-neutral-400">Accuracy</div>
                        <div className="text-lg font-bold text-emerald-400">{session.accuracy?.toFixed(1)}%</div>
                    </div>
                    <div>
                        <div className="text-xs text-neutral-400">Mistakes</div>
                        <div className="text-lg font-bold text-red-400">{session.mistakes}</div>
                    </div>
                    <div>
                        <div className="text-xs text-neutral-400">Net Profit</div>
                        <div className={`text-lg font-bold ${session.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${session.net_profit?.toFixed(0)}
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    <table className="w-full">
                        <thead className="bg-neutral-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300">Hand</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300">Dealer</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300">Action</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300">Correct?</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300">TC</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {events.map((event, idx) => (
                                <tr key={idx} className={event.is_correct ? '' : 'bg-red-900/20'}>
                                    <td className="px-4 py-2 text-sm font-mono text-white">
                                        {event.player_cards?.join(', ')}
                                    </td>
                                    <td className="px-4 py-2 text-sm font-mono text-white">
                                        {event.dealer_up_card}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                        <span className={event.is_correct ? 'text-green-400' : 'text-red-400'}>
                                            {event.player_action}
                                        </span>
                                        {!event.is_correct && (
                                            <span className="text-neutral-400 text-xs ml-2">
                                                (should: {event.recommended_action})
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                        {event.is_correct ? (
                                            <span className="text-green-400">Yes</span>
                                        ) : (
                                            <span className="text-red-400">No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-sm font-mono text-yellow-400">
                                        {event.true_count?.toFixed(1)}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                        {event.hand_result && (
                                            <span className={
                                                event.hand_result === 'win' ? 'text-green-400' :
                                                event.hand_result === 'loss' ? 'text-red-400' :
                                                'text-yellow-400'
                                            }>
                                                {event.hand_result}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {events.length === 0 && (
                        <div className="text-center text-neutral-400 py-8">
                            No hand events recorded for this session.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
