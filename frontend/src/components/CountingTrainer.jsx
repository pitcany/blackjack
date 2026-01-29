// Card Counting Training Component
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlayingCard } from './PlayingCard';
import { useCountingTrainer } from '@/lib/useGameState';
import { CheckCircle2, XCircle, Zap, Target, TrendingUp } from 'lucide-react';

export function CountingTrainer() {
  const { config, state, stats, actions, decksRemaining } = useCountingTrainer();
  
  const [settings, setSettings] = useState({
    numDecks: 6,
    drillType: 'single_card',
    cardsPerRound: 1,
    askTrueCount: false
  });

  const [rcGuess, setRcGuess] = useState('');
  const [tcGuess, setTcGuess] = useState('');

  const handleStart = () => {
    actions.start(settings);
    setTimeout(() => actions.dealRound(), 100);
  };

  const handleSubmit = () => {
    const rc = parseInt(rcGuess);
    if (isNaN(rc)) return;
    
    const tc = settings.askTrueCount && tcGuess !== '' ? parseFloat(tcGuess) : null;
    actions.submitGuess(rc, tc);
  };

  const handleNext = () => {
    setRcGuess('');
    setTcGuess('');
    actions.dealRound();
  };

  const accuracy = stats.attempts > 0 
    ? Math.round((stats.correctRC / stats.attempts) * 100) 
    : 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display text-foreground mb-2">
          Hi-Lo Card Counting Trainer
        </h1>
        <p className="text-muted-foreground">
          2-6: <span className="text-success font-bold">+1</span> | 
          7-9: <span className="text-muted-foreground font-bold">0</span> | 
          10-A: <span className="text-destructive font-bold">-1</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-display text-primary">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Number of Decks</Label>
              <Select 
                value={settings.numDecks.toString()} 
                onValueChange={(v) => setSettings(s => ({ ...s, numDecks: parseInt(v) }))}
                disabled={state.isRunning}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 4, 6, 8].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} Deck{n > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Drill Type</Label>
              <Select 
                value={settings.drillType} 
                onValueChange={(v) => setSettings(s => ({ ...s, drillType: v }))}
                disabled={state.isRunning}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_card">Single Card</SelectItem>
                  <SelectItem value="hand">Hand (2 cards)</SelectItem>
                  <SelectItem value="round">Full Round (4 cards)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.drillType === 'single_card' && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Cards Per Round</Label>
                <Select 
                  value={settings.cardsPerRound.toString()} 
                  onValueChange={(v) => setSettings(s => ({ ...s, cardsPerRound: parseInt(v) }))}
                  disabled={state.isRunning}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <Label className="text-muted-foreground">Ask True Count</Label>
              <Switch
                checked={settings.askTrueCount}
                onCheckedChange={(v) => setSettings(s => ({ ...s, askTrueCount: v }))}
                disabled={state.isRunning}
              />
            </div>

            <Button
              onClick={state.isRunning ? actions.stop : handleStart}
              className={cn(
                'w-full mt-4',
                state.isRunning 
                  ? 'bg-destructive hover:bg-destructive/80' 
                  : 'bg-success hover:bg-success/80'
              )}
            >
              {state.isRunning ? 'Stop Training' : 'Start Training'}
            </Button>
          </CardContent>
        </Card>

        {/* Main Training Area */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardContent className="p-6">
            {!state.isRunning ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Target className="w-12 h-12 mb-4 text-primary/50" />
                <p>Click "Start Training" to begin</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cards Display */}
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-4">
                    {state.showingCards ? 'Count these cards:' : 'Enter your count'}
                  </span>
                  <div className="flex gap-3 justify-center flex-wrap min-h-32">
                    {state.currentCards.map((card, index) => (
                      <PlayingCard
                        key={index}
                        card={card}
                        size="xl"
                        animate={state.showingCards}
                        delay={index * 150}
                      />
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                {state.showingCards && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <Label className="text-muted-foreground text-sm">Running Count</Label>
                        <Input
                          type="number"
                          value={rcGuess}
                          onChange={(e) => setRcGuess(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                          className="w-24 text-center text-lg font-bold"
                          placeholder="RC"
                          autoFocus
                        />
                      </div>
                      
                      {settings.askTrueCount && (
                        <div className="flex flex-col items-center gap-1">
                          <Label className="text-muted-foreground text-sm">True Count</Label>
                          <Input
                            type="number"
                            step="0.5"
                            value={tcGuess}
                            onChange={(e) => setTcGuess(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="w-24 text-center text-lg font-bold"
                            placeholder="TC"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmit}
                      className="bg-primary hover:bg-primary/80 min-w-32"
                    >
                      Submit
                    </Button>
                  </div>
                )}

                {/* Feedback */}
                {state.feedback && (
                  <div className={cn(
                    'p-4 rounded-xl border animate-fade-in',
                    state.feedback.isCorrectRC 
                      ? 'bg-success/10 border-success/30' 
                      : 'bg-destructive/10 border-destructive/30'
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      {state.feedback.isCorrectRC ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <span className={cn(
                        'font-semibold',
                        state.feedback.isCorrectRC ? 'text-success' : 'text-destructive'
                      )}>
                        {state.feedback.isCorrectRC ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-foreground">
                        <span className="text-muted-foreground">Running Count: </span>
                        <span className="font-bold">{state.feedback.expectedRC}</span>
                        {!state.feedback.isCorrectRC && (
                          <span className="text-muted-foreground"> (you said {state.feedback.userRC})</span>
                        )}
                      </p>
                      
                      {settings.askTrueCount && state.feedback.isCorrectTC !== null && (
                        <p className="text-foreground">
                          <span className="text-muted-foreground">True Count: </span>
                          <span className="font-bold">{state.feedback.expectedTC}</span>
                          {!state.feedback.isCorrectTC && (
                            <span className="text-muted-foreground"> (you said {state.feedback.userTC})</span>
                          )}
                        </p>
                      )}

                      <p className="text-muted-foreground">
                        Card values: {state.feedback.cardValues.map(cv => 
                          `${cv.card} (${cv.value})`
                        ).join(', ')}
                      </p>
                      
                      <p className="text-muted-foreground">
                        Decks remaining: {state.feedback.decksRemaining}
                      </p>
                    </div>

                    <Button
                      onClick={handleNext}
                      className="w-full mt-4 bg-primary hover:bg-primary/80"
                    >
                      Next Round
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Bar */}
      <Card className="mt-6 bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-around flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Attempts:</span>
              <span className="font-bold">{stats.attempts}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-muted-foreground">Accuracy:</span>
              <span className={cn(
                'font-bold',
                accuracy >= 80 ? 'text-success' : accuracy >= 50 ? 'text-warning' : 'text-destructive'
              )}>
                {accuracy}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-muted-foreground">Streak:</span>
              <span className="font-bold text-warning">{stats.streak}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Best Streak:</span>
              <span className="font-bold text-primary">{stats.bestStreak}</span>
            </div>
            {state.isRunning && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Current RC:</span>
                <Badge variant="outline" className="text-primary border-primary/30">
                  {state.runningCount}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CountingTrainer;
