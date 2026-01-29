// Stats Dashboard Component
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { loadHandHistory, loadStrategyStats, loadGameStats, loadTrainingStats } from '@/lib/storage';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  Trophy, TrendingUp, TrendingDown, Target, Award, 
  AlertTriangle, CheckCircle2, XCircle, Percent 
} from 'lucide-react';

export function StatsPanel() {
  const gameStats = useMemo(() => loadGameStats(), []);
  const strategyStats = useMemo(() => loadStrategyStats(), []);
  const handHistory = useMemo(() => loadHandHistory(), []);
  const trainingStats = useMemo(() => loadTrainingStats(), []);

  // Calculate win rate
  const winRate = gameStats.handsPlayed > 0 
    ? Math.round((gameStats.handsWon / gameStats.handsPlayed) * 100) 
    : 0;

  // Calculate strategy accuracy
  const strategyAccuracy = strategyStats.totalDecisions > 0
    ? Math.round((strategyStats.correctDecisions / strategyStats.totalDecisions) * 100)
    : 0;

  // Get top 5 mistakes
  const topMistakes = useMemo(() => {
    if (!strategyStats.mistakes) return [];
    return Object.entries(strategyStats.mistakes)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([situation, data]) => ({
        situation,
        count: data.count,
        correct: data.correct,
        wrong: data.wrong
      }));
  }, [strategyStats.mistakes]);

  // Generate bankroll history from hand history
  const bankrollHistory = useMemo(() => {
    if (!handHistory || handHistory.length === 0) return [];
    
    // Get last 50 hands for the chart
    const recent = handHistory.slice(0, 50).reverse();
    let runningBankroll = 1000; // Assume starting from 1000
    
    return recent.map((hand, index) => {
      if (hand.bankrollAfter) {
        runningBankroll = hand.bankrollAfter;
      }
      return {
        hand: index + 1,
        bankroll: runningBankroll
      };
    });
  }, [handHistory]);

  // Outcome distribution for pie chart
  const outcomeData = useMemo(() => {
    const data = [
      { name: 'Wins', value: gameStats.handsWon, color: 'hsl(145, 60%, 45%)' },
      { name: 'Losses', value: gameStats.handsLost, color: 'hsl(0, 70%, 50%)' },
      { name: 'Pushes', value: gameStats.pushes, color: 'hsl(220, 10%, 50%)' },
      { name: 'Surrenders', value: gameStats.surrenders || 0, color: 'hsl(35, 90%, 55%)' }
    ].filter(d => d.value > 0);
    return data;
  }, [gameStats]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display text-foreground mb-2">
          Statistics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your performance and improve your game
        </p>
      </div>

      {/* Key Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{gameStats.handsPlayed}</p>
                <p className="text-sm text-muted-foreground">Hands Played</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                winRate >= 45 ? "bg-success/20" : "bg-destructive/20"
              )}>
                {winRate >= 45 ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{winRate}%</p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Award className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{gameStats.blackjacks}</p>
                <p className="text-sm text-muted-foreground">Blackjacks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                strategyAccuracy >= 80 ? "bg-success/20" : "bg-warning/20"
              )}>
                <Target className="w-5 h-5" style={{ 
                  color: strategyAccuracy >= 80 ? 'hsl(145, 60%, 45%)' : 'hsl(35, 90%, 55%)' 
                }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{strategyAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Strategy Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bankroll Chart */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display text-primary">Bankroll History</CardTitle>
          </CardHeader>
          <CardContent>
            {bankrollHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={bankrollHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                  <XAxis 
                    dataKey="hand" 
                    stroke="hsl(220, 10%, 50%)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(220, 10%, 50%)"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(220, 18%, 10%)', 
                      border: '1px solid hsl(220, 15%, 18%)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(45, 30%, 95%)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bankroll" 
                    stroke="hsl(45, 85%, 55%)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Play some hands to see your bankroll history
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outcome Distribution */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display text-primary">Outcome Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {outcomeData.length > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {outcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(220, 18%, 10%)', 
                        border: '1px solid hsl(220, 15%, 18%)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Play some hands to see your outcome distribution
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategy Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Accuracy Breakdown */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display text-primary">Strategy Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Decisions</span>
                <span className="font-medium">{strategyStats.totalDecisions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Correct Decisions</span>
                <span className="font-medium text-success">{strategyStats.correctDecisions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mistakes</span>
                <span className="font-medium text-destructive">
                  {strategyStats.totalDecisions - strategyStats.correctDecisions}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Accuracy</span>
                <span className="font-medium">{strategyAccuracy}%</span>
              </div>
              <Progress value={strategyAccuracy} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Common Mistakes */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Common Mistakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topMistakes.length > 0 ? (
              <div className="space-y-3">
                {topMistakes.map((mistake, index) => (
                  <div 
                    key={mistake.situation}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">
                          {mistake.situation.replace('_vs_', ' vs ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Should: <span className="text-success">{mistake.correct}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">
                      {mistake.count}x
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mb-2 text-success/50" />
                <p>No mistakes recorded yet!</p>
                <p className="text-sm">Keep playing with hints to track accuracy</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Training Stats */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-display text-primary">Card Counting Training</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{trainingStats.totalAttempts || 0}</p>
              <p className="text-sm text-muted-foreground">Total Drills</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">
                {trainingStats.totalAttempts > 0 
                  ? Math.round((trainingStats.correctRC / trainingStats.totalAttempts) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">RC Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{trainingStats.bestStreak || 0}</p>
              <p className="text-sm text-muted-foreground">Best Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">
                {trainingStats.totalAttempts > 0 
                  ? Math.round((trainingStats.correctTC / trainingStats.totalAttempts) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">TC Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StatsPanel;
