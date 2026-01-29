import React, { useState } from 'react';
import "@/App.css";
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GameTable } from '@/components/GameTable';
import { CountingTrainer } from '@/components/CountingTrainer';
import { StatsPanel } from '@/components/StatsPanel';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useBlackjackGame } from '@/lib/useGameState';
import { Spade, Heart, Club, Diamond, Settings, Trophy, TrendingUp, BookOpen, BarChart3 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('blackjack');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hintMode, setHintMode] = useState('on-demand');

  const {
    gameState,
    stats,
    strategyStats,
    handHistory,
    config,
    actions,
    getAvailableActions,
    getOptimalAction,
    getDeviationInfo,
    decksRemaining,
    trueCount,
  } = useBlackjackGame();

  const tabs = [
    { id: 'blackjack', label: 'Blackjack', icon: Spade },
    { id: 'training', label: 'Card Counting', icon: BookOpen },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-casino">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 text-primary text-2xl">
                <Spade className="w-6 h-6" />
                <Heart className="w-6 h-6 text-card-red" />
                <Club className="w-6 h-6" />
                <Diamond className="w-6 h-6 text-card-red" />
              </div>
              <h1 className="text-xl font-display font-bold text-foreground hidden sm:block">
                Blackjack <span className="text-primary">Trainer</span>
              </h1>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'gap-2',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Button>
              ))}
            </nav>

            {/* Settings & Stats */}
            <div className="flex items-center gap-3">
              {activeTab === 'blackjack' && (
                <div className="hidden md:flex items-center gap-4">
                  <Badge variant="outline" className="gap-1">
                    <Trophy className="w-3 h-3 text-primary" />
                    {stats.handsWon}/{stats.handsPlayed}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    {stats.blackjacks} BJ
                  </Badge>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'blackjack' ? (
          <GameTable
            gameState={gameState}
            actions={actions}
            getAvailableActions={getAvailableActions}
            getOptimalAction={getOptimalAction}
            getDeviationInfo={getDeviationInfo}
            decksRemaining={decksRemaining}
            trueCount={trueCount}
            config={config}
            strategyStats={strategyStats}
            hintMode={hintMode}
          />
        ) : activeTab === 'training' ? (
          <CountingTrainer />
        ) : (
          <StatsPanel
            stats={stats}
            strategyStats={strategyStats}
            handHistory={handHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Built with React
            </p>
            <div className="flex items-center gap-4">
              <span>Hi-Lo: 2-6 (+1) | 7-9 (0) | 10-A (-1)</span>
              <span>H/S/D/P/R = Actions | Enter = Deal/Next | 1-5 = Chips</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        config={config}
        onApply={actions.updateConfig}
        hintMode={hintMode}
        onHintModeChange={setHintMode}
        onResetAllData={actions.resetAllData}
      />

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
