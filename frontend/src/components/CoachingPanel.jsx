// Coaching Panel Component - Personalized training dashboard and drill runner
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { loadStrategyStats } from '@/lib/storage';
import {
  analyzeWeaknesses,
  generateTrainingSession,
  evaluateDrillAnswer,
  getCategoryDisplayName,
  getSeverityLabel,
  DRILL_LIBRARY,
  WeaknessCategory
} from '@/lib/coachingEngine';
import {
  getPerformanceStats,
  recordDrillCompletion,
  recordSessionCompletion,
  getPracticeRecommendation,
  shouldPracticeToday
} from '@/lib/coachingProgress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Flame,
  Award,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';
import { toast } from 'sonner';

// Card display helper
function getCardDisplay(value) {
  if (value === 11) return 'A';
  if (value === 10) return '10';
  return value.toString();
}

export function CoachingPanel() {
  const [activeView, setActiveView] = useState('dashboard');
  const [weaknesses, setWeaknesses] = useState([]);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [drillState, setDrillState] = useState({
    currentDrillIndex: 0,
    currentScenarioIndex: 0,
    results: [],
    startTime: null,
    isComplete: false
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const isInitialMount = useRef(true);

  // Load data on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const strategyStats = loadStrategyStats();
      const analyzed = analyzeWeaknesses(strategyStats);
      setWeaknesses(analyzed);
      setPerformanceStats(getPerformanceStats());
    }
  }, []);

  const refreshData = useCallback(() => {
    const strategyStats = loadStrategyStats();
    const analyzed = analyzeWeaknesses(strategyStats);
    setWeaknesses(analyzed);
    setPerformanceStats(getPerformanceStats());
  }, []);

  // Start a training session
  const startSession = useCallback((options = {}) => {
    const session = generateTrainingSession(weaknesses, options);
    setCurrentSession(session);
    setDrillState({
      currentDrillIndex: 0,
      currentScenarioIndex: 0,
      results: [],
      startTime: Date.now(),
      isComplete: false
    });
    setActiveView('drill');
    setShowAnswer(false);
  }, [weaknesses]);

  // Start a specific drill
  const startDrill = useCallback((drillId) => {
    const drill = DRILL_LIBRARY.find(d => d.id === drillId);
    if (!drill) return;

    const session = {
      id: Date.now(),
      drills: [drill],
      focusAreas: [drill.category],
      totalScenarios: drill.scenarios.length
    };
    setCurrentSession(session);
    setDrillState({
      currentDrillIndex: 0,
      currentScenarioIndex: 0,
      results: [],
      startTime: Date.now(),
      isComplete: false
    });
    setActiveView('drill');
    setShowAnswer(false);
  }, []);

  // Handle answer
  const handleAnswer = useCallback((answer) => {
    if (!currentSession || drillState.isComplete) return;

    const currentDrill = currentSession.drills[drillState.currentDrillIndex];
    const evaluation = evaluateDrillAnswer(currentDrill, drillState.currentScenarioIndex, answer);

    setDrillState(prev => ({
      ...prev,
      results: [...prev.results, {
        drillId: currentDrill.id,
        scenarioIndex: prev.currentScenarioIndex,
        ...evaluation
      }]
    }));
    setShowAnswer(true);

    if (!evaluation.correct) {
      toast.error(`Incorrect! The correct answer is ${evaluation.correctAnswer}`);
    } else {
      toast.success('Correct!');
    }
  }, [currentSession, drillState]);

  // Move to next scenario
  const nextScenario = useCallback(() => {
    if (!currentSession) return;

    const currentDrill = currentSession.drills[drillState.currentDrillIndex];
    const isLastScenario = drillState.currentScenarioIndex >= currentDrill.scenarios.length - 1;
    const isLastDrill = drillState.currentDrillIndex >= currentSession.drills.length - 1;

    if (isLastScenario && isLastDrill) {
      // Session complete
      const timeSpent = Math.round((Date.now() - drillState.startTime) / 1000);
      const correctCount = drillState.results.filter(r => r.correct).length;
      const totalScenarios = drillState.results.length;

      // Record completion
      recordSessionCompletion(currentSession, {
        totalScenarios,
        correctCount,
        timeSpent
      });

      setDrillState(prev => ({ ...prev, isComplete: true }));
      refreshData();
    } else if (isLastScenario) {
      // Next drill
      const completedDrill = currentSession.drills[drillState.currentDrillIndex];
      const drillResults = drillState.results.filter(r => r.drillId === completedDrill.id);
      const correctCount = drillResults.filter(r => r.correct).length;

      recordDrillCompletion(completedDrill, {
        totalScenarios: drillResults.length,
        correctCount,
        timeSpent: Math.round((Date.now() - drillState.startTime) / 1000)
      });

      setDrillState(prev => ({
        ...prev,
        currentDrillIndex: prev.currentDrillIndex + 1,
        currentScenarioIndex: 0
      }));
    } else {
      // Next scenario
      setDrillState(prev => ({
        ...prev,
        currentScenarioIndex: prev.currentScenarioIndex + 1
      }));
    }
    setShowAnswer(false);
  }, [currentSession, drillState, refreshData]);

  // Skip drill
  const skipDrill = useCallback(() => {
    if (!currentSession) return;

    const isLastDrill = drillState.currentDrillIndex >= currentSession.drills.length - 1;

    if (isLastDrill) {
      setDrillState(prev => ({ ...prev, isComplete: true }));
    } else {
      setDrillState(prev => ({
        ...prev,
        currentDrillIndex: prev.currentDrillIndex + 1,
        currentScenarioIndex: 0
      }));
    }
    setShowAnswer(false);
  }, [currentSession, drillState]);

  // Render dashboard view
  const renderDashboard = () => {
    const recommendation = getPracticeRecommendation(weaknesses);
    const needsPractice = shouldPracticeToday();

    return (
      <div className="space-y-6" data-testid="coaching-dashboard">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Accuracy</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {performanceStats?.overallAccuracy || 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Streak</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {performanceStats?.currentStreak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Drills</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {performanceStats?.totalDrills || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                {performanceStats?.improvementTrend >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
                <span className="text-sm text-muted-foreground">Trend</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {performanceStats?.improvementTrend >= 0 ? '+' : ''}
                {performanceStats?.improvementTrend || 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Practice Recommendation */}
        <Card className={cn(
          "border-2",
          needsPractice ? "border-primary/50" : "border-success/30"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Today&apos;s Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{recommendation.reason}</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => startSession({ focusCategory: recommendation.category })}
                className="bg-primary hover:bg-primary/80"
                data-testid="start-session-btn"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Training
              </Button>
              <Button 
                variant="outline"
                onClick={() => startSession()}
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Session
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-warning" />
                Areas to Improve
              </CardTitle>
              <CardDescription>
                Based on your gameplay mistakes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {weaknesses.slice(0, 3).map((weakness, i) => {
                const severity = getSeverityLabel(weakness.severity);
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{getCategoryDisplayName(weakness.category)}</p>
                      <p className="text-sm text-muted-foreground">
                        {weakness.mistakeCount} mistakes recorded
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={severity.color}>{severity.label}</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => startSession({ focusCategory: weakness.category })}
                      >
                        Practice
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Performance Chart */}
        {performanceStats?.dailyTrends?.length > 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...performanceStats.dailyTrends].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#888' }}
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12, fill: '#888' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      formatter={(v) => [`${v}%`, 'Accuracy']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#d4af37" 
                      strokeWidth={2}
                      dot={{ fill: '#d4af37', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render drill library view
  const renderDrillLibrary = () => {
    const categories = Object.values(WeaknessCategory);
    const drillsByCategory = {};
    
    for (const drill of DRILL_LIBRARY) {
      if (!drillsByCategory[drill.category]) {
        drillsByCategory[drill.category] = [];
      }
      drillsByCategory[drill.category].push(drill);
    }

    return (
      <div className="space-y-6" data-testid="drill-library">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Drill Library</h3>
            <p className="text-sm text-muted-foreground">
              {DRILL_LIBRARY.length} drills available
            </p>
          </div>
          <Button onClick={() => startSession()} data-testid="start-random-session">
            <Zap className="w-4 h-4 mr-2" />
            Random Session
          </Button>
        </div>

        {Object.entries(drillsByCategory).map(([category, drills]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{getCategoryDisplayName(category)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {drills.map((drill) => (
                <div 
                  key={drill.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{drill.name}</p>
                    <p className="text-sm text-muted-foreground">{drill.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {drill.scenarios.length} scenarios
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {drill.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => startDrill(drill.id)}
                    data-testid={`start-drill-${drill.id}`}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render drill view
  const renderDrill = () => {
    if (!currentSession) return null;

    if (drillState.isComplete) {
      const correctCount = drillState.results.filter(r => r.correct).length;
      const totalScenarios = drillState.results.length;
      const accuracy = totalScenarios > 0 
        ? Math.round((correctCount / totalScenarios) * 100)
        : 0;

      return (
        <Card className="max-w-2xl mx-auto" data-testid="drill-complete">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Session Complete!</CardTitle>
            <CardDescription>Great work on your training session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-success">{correctCount}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-destructive">{totalScenarios - correctCount}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2 justify-center">
              <Button onClick={() => startSession()} className="bg-primary hover:bg-primary/80">
                <RefreshCw className="w-4 h-4 mr-2" />
                New Session
              </Button>
              <Button variant="outline" onClick={() => setActiveView('dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    const currentDrill = currentSession.drills[drillState.currentDrillIndex];
    const currentScenario = currentDrill.scenarios[drillState.currentScenarioIndex];
    const progress = ((drillState.currentDrillIndex * 100) + 
      ((drillState.currentScenarioIndex / currentDrill.scenarios.length) * 100)) / 
      currentSession.drills.length;

    return (
      <div className="max-w-2xl mx-auto space-y-4" data-testid="drill-runner">
        {/* Progress */}
        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm text-muted-foreground">
            Drill {drillState.currentDrillIndex + 1}/{currentSession.drills.length}
          </span>
        </div>

        {/* Drill Info */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{currentDrill.name}</CardTitle>
              <Badge variant="outline">{currentDrill.difficulty}</Badge>
            </div>
            <CardDescription>{currentDrill.description}</CardDescription>
          </CardHeader>
        </Card>

        {/* Scenario */}
        <Card className="border-2 border-primary/30">
          <CardContent className="pt-6">
            {/* Hand Display */}
            <div className="text-center space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Dealer Shows</p>
                <div className="inline-flex items-center justify-center w-16 h-20 rounded-lg bg-card border-2 border-border text-2xl font-bold">
                  {getCardDisplay(currentScenario.dealerUpcard)}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Hand</p>
                <div className="flex items-center justify-center gap-2">
                  {currentScenario.playerHand.map((card, i) => (
                    <div 
                      key={i}
                      className="inline-flex items-center justify-center w-16 h-20 rounded-lg bg-card border-2 border-border text-2xl font-bold"
                    >
                      {getCardDisplay(card)}
                    </div>
                  ))}
                </div>
                <p className="text-lg font-semibold mt-2">
                  Total: {currentScenario.playerHand.reduce((sum, c) => sum + (c === 11 ? 11 : c), 0)}
                  {currentScenario.playerHand.includes(11) && ' (Soft)'}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Answer Buttons or Result */}
            {showAnswer ? (
              <div className="space-y-4">
                <div className={cn(
                  "p-4 rounded-lg text-center",
                  drillState.results[drillState.results.length - 1]?.correct
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                )}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {drillState.results[drillState.results.length - 1]?.correct ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                    <span className="font-bold">
                      {drillState.results[drillState.results.length - 1]?.correct 
                        ? 'Correct!' 
                        : `Incorrect - Answer: ${currentScenario.correctAction}`}
                    </span>
                  </div>
                  <p className="text-sm opacity-80">
                    {drillState.results[drillState.results.length - 1]?.explanation}
                  </p>
                </div>
                <Button 
                  onClick={nextScenario} 
                  className="w-full bg-primary hover:bg-primary/80"
                  data-testid="next-scenario-btn"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Next
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">What&apos;s the optimal play?</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleAnswer('HIT')}
                    data-testid="answer-hit"
                  >
                    HIT
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleAnswer('STAND')}
                    data-testid="answer-stand"
                  >
                    STAND
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleAnswer('DOUBLE')}
                    data-testid="answer-double"
                  >
                    DOUBLE
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleAnswer('SPLIT')}
                    data-testid="answer-split"
                  >
                    SPLIT
                  </Button>
                </div>
                {currentDrill.scenarios.some(s => s.correctAction === 'SURRENDER') && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full"
                    onClick={() => handleAnswer('SURRENDER')}
                    data-testid="answer-surrender"
                  >
                    SURRENDER
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setActiveView('dashboard')}>
            Exit Session
          </Button>
          <Button variant="ghost" onClick={skipDrill}>
            <SkipForward className="w-4 h-4 mr-2" />
            Skip Drill
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" data-testid="coaching-panel">
      {/* View Tabs (only show when not in drill) */}
      {activeView !== 'drill' && (
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="dashboard" className="gap-2">
              <Brain className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Drill Library
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Content */}
      {activeView === 'dashboard' && renderDashboard()}
      {activeView === 'library' && renderDrillLibrary()}
      {activeView === 'drill' && renderDrill()}
    </div>
  );
}

export default CoachingPanel;
