// Stats Dashboard Component
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Target, AlertTriangle } from 'lucide-react';

export function StatsPanel({ stats, strategyStats, handHistory }) {
  const winRate = stats.handsPlayed > 0
    ? Math.round((stats.handsWon / stats.handsPlayed) * 100)
    : 0;

  const strategyAccuracy = strategyStats.totalDecisions > 0
    ? Math.round((strategyStats.correctDecisions / strategyStats.totalDecisions) * 100)
    : 0;

  // Build win-rate-over-time chart data from hand history
  const chartData = useMemo(() => {
    if (handHistory.length === 0) return [];
    const data = [];
    let wins = 0;
    let total = 0;
    // Sample every few hands to keep chart clean
    const step = Math.max(1, Math.floor(handHistory.length / 50));
    for (let i = 0; i < handHistory.length; i++) {
      total++;
      if (handHistory[i].outcome === 'WIN' || handHistory[i].outcome === 'BLACKJACK') {
        wins++;
      }
      if (i % step === 0 || i === handHistory.length - 1) {
        data.push({
          hand: total,
          winRate: Math.round((wins / total) * 100),
        });
      }
    }
    return data;
  }, [handHistory]);

  // Bankroll over time
  const bankrollData = useMemo(() => {
    if (handHistory.length === 0) return [];
    const data = [{ hand: 0, bankroll: 1000 }]; // approximate starting point
    let bankroll = 1000;
    const step = Math.max(1, Math.floor(handHistory.length / 50));
    for (let i = 0; i < handHistory.length; i++) {
      const h = handHistory[i];
      if (h.outcome === 'WIN') bankroll += h.bet;
      else if (h.outcome === 'BLACKJACK') bankroll += Math.floor(h.bet * 1.5);
      else if (h.outcome === 'LOSE' || h.outcome === 'BUST') bankroll -= h.bet;
      else if (h.outcome === 'SURRENDER') bankroll -= Math.floor(h.bet / 2);
      if (i % step === 0 || i === handHistory.length - 1) {
        data.push({ hand: i + 1, bankroll });
      }
    }
    return data;
  }, [handHistory]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-display text-foreground">Statistics Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Target className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-2xl font-bold text-success">{strategyAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Strategy Accuracy</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.handsPlayed}</p>
            <p className="text-xs text-muted-foreground">Hands Played</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.blackjacks}</p>
            <p className="text-xs text-muted-foreground">Blackjacks</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display text-primary">Game Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wins</span>
              <span className="font-medium text-success">{stats.handsWon}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Losses</span>
              <span className="font-medium text-destructive">{stats.handsLost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pushes</span>
              <span className="font-medium">{stats.pushes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Blackjacks</span>
              <span className="font-medium text-primary">{stats.blackjacks}</span>
            </div>
            <div className="flex justify-between border-t border-border/30 pt-2">
              <span className="text-muted-foreground">Strategy Decisions</span>
              <span className="font-medium">{strategyStats.correctDecisions}/{strategyStats.totalDecisions}</span>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate Chart */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display text-primary">Win Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hand" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="winRate" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Win %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Play more hands to see chart data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bankroll Chart */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display text-primary">Bankroll Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {bankrollData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bankrollData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hand" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="bankroll" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Bankroll" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Play more hands to see bankroll history
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Hands */}
      {handHistory.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display text-primary">Recent Hands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {handHistory.slice(-20).reverse().map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/20 last:border-0">
                  <span className="text-muted-foreground font-mono">{h.playerCards.join(', ')}</span>
                  <span className="text-muted-foreground">vs {h.dealerCards[0]}</span>
                  <Badge variant="outline" className={cn(
                    'text-xs',
                    (h.outcome === 'WIN' || h.outcome === 'BLACKJACK') && 'text-success border-success/30',
                    (h.outcome === 'LOSE' || h.outcome === 'BUST') && 'text-destructive border-destructive/30',
                    h.outcome === 'PUSH' && 'text-muted-foreground',
                    h.outcome === 'SURRENDER' && 'text-warning border-warning/30',
                  )}>
                    {h.outcome}
                  </Badge>
                  <span className="text-muted-foreground">${h.bet}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StatsPanel;
