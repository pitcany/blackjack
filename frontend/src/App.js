import React, { useState, useEffect } from 'react';
import "@/App.css";
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { GameTable } from '@/components/GameTable';
import { CountingTrainer } from '@/components/CountingTrainer';
import { StatsPanel } from '@/components/StatsPanel';
import { CoachingPanel } from '@/components/CoachingPanel';
import { SettingsDialog } from '@/components/SettingsDialog';
import { AuthDialog } from '@/components/AuthDialog';
import { useBlackjackGame } from '@/lib/useGameState';
import { AuthProvider, useAuth } from '@/lib/authContext';
import { setupAutoSync } from '@/lib/syncService';
import { 
  Spade, Heart, Club, Diamond, Settings, Trophy, TrendingUp, 
  BookOpen, BarChart3, User, Cloud, Brain 
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('blackjack');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { 
    gameState, 
    stats, 
    strategyStats,
    config, 
    actions, 
    getAvailableActions,
    getHint,
    decksRemaining 
  } = useBlackjackGame();

  // Setup auto-sync when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const cleanup = setupAutoSync(60000); // Sync every minute
      return cleanup;
    }
  }, [isAuthenticated]);

  const tabs = [
    { id: 'blackjack', label: 'Blackjack', icon: Spade },
    { id: 'training', label: 'Card Counting', icon: BookOpen },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  // Calculate strategy accuracy for header
  const strategyAccuracy = strategyStats.totalDecisions > 0
    ? Math.round((strategyStats.correctDecisions / strategyStats.totalDecisions) * 100)
    : null;

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
                  data-testid={`tab-${tab.id}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Button>
              ))}
            </nav>

            {/* Settings, Auth & Stats */}
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
                  {strategyAccuracy !== null && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "gap-1",
                        strategyAccuracy >= 80 ? "text-success border-success/30" :
                        strategyAccuracy >= 60 ? "text-warning border-warning/30" :
                        "text-destructive border-destructive/30"
                      )}
                    >
                      {strategyAccuracy}% Accuracy
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Auth Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setAuthOpen(true)}
                className={cn(
                  "text-muted-foreground hover:text-foreground relative",
                  isAuthenticated && "text-success"
                )}
                data-testid="auth-button"
              >
                {isAuthenticated && user ? (
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user.picture} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="w-5 h-5" />
                )}
                {isAuthenticated && (
                  <Cloud className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-success" />
                )}
              </Button>
              
              {/* Settings Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="text-muted-foreground hover:text-foreground"
                data-testid="settings-button"
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
            getHint={getHint}
            decksRemaining={decksRemaining}
            config={config}
          />
        ) : activeTab === 'training' ? (
          <CountingTrainer />
        ) : (
          <StatsPanel />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Built with React • Practice responsibly
            </p>
            <div className="flex items-center gap-4">
              <span>Hi-Lo: 2-6 (+1) • 7-9 (0) • 10-A (-1)</span>
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
      />

      {/* Auth Dialog */}
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
      />

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
