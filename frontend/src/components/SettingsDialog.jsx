// Settings Dialog Component
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { defaultConfig } from '@/lib/gameLogic';
import { clearAllData } from '@/lib/storage';
import { useAuth } from '@/lib/authContext';
import { fullSync, getSyncStatus } from '@/lib/syncService';
import { toast } from 'sonner';
import { AlertTriangle, Trash2, User, Cloud, RefreshCw, LogIn, LogOut, Loader2, CheckCircle } from 'lucide-react';

export function SettingsDialog({ open, onOpenChange, config, onApply }) {
  const [settings, setSettings] = useState(config);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();

  // Sync local settings when dialog opens or config changes externally
  React.useEffect(() => {
    if (open) {
      setSettings(config);
    }
  }, [open, config]);

  const handleApply = () => {
    onApply(settings);
    onOpenChange(false);
  };

  const handleReset = () => {
    setSettings(defaultConfig);
  };

  const handleClearData = () => {
    clearAllData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  const handleSync = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      return;
    }
    setSyncing(true);
    try {
      const result = await fullSync();
      if (result.success) {
        toast.success('Data synced successfully!');
      } else {
        toast.error(`Sync failed: ${result.reason}`);
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
  };

  const syncStatus = getSyncStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">Game Settings</DialogTitle>
          <DialogDescription>
            Customize your Blackjack game rules. Changes will start a new session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Game Rules Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Game Rules
            </h4>

            {/* Number of Decks */}
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Number of Decks</Label>
              <Select 
                value={settings.numDecks.toString()} 
                onValueChange={(v) => setSettings(s => ({ ...s, numDecks: parseInt(v) }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 4, 6, 8].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Starting Bankroll */}
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Starting Bankroll</Label>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={settings.startingBankroll}
                  onChange={(e) => setSettings(s => ({ ...s, startingBankroll: parseInt(e.target.value) || 1000 }))}
                  className="w-24 text-right"
                  min={100}
                  max={100000}
                />
              </div>
            </div>

            {/* Minimum Bet */}
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Minimum Bet</Label>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={settings.minBet}
                  onChange={(e) => setSettings(s => ({ ...s, minBet: parseInt(e.target.value) || 10 }))}
                  className="w-24 text-right"
                  min={1}
                  max={1000}
                />
              </div>
            </div>

            {/* Penetration */}
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Penetration (%)</Label>
              <Input
                type="number"
                value={Math.round(settings.penetration * 100)}
                onChange={(e) => setSettings(s => ({ ...s, penetration: (parseInt(e.target.value) || 75) / 100 }))}
                className="w-24 text-right"
                min={50}
                max={90}
              />
            </div>
          </div>

          <Separator />

          {/* Dealer Rules */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Dealer Rules
            </h4>

            {/* Dealer Hits Soft 17 */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Dealer Hits Soft 17</Label>
                <p className="text-xs text-muted-foreground">H17 rule (worse for player)</p>
              </div>
              <Switch
                checked={settings.dealerHitsSoft17}
                onCheckedChange={(v) => setSettings(s => ({ ...s, dealerHitsSoft17: v }))}
              />
            </div>
          </div>

          <Separator />

          {/* Player Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Player Options
            </h4>

            {/* Double After Split */}
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Double After Split</Label>
              <Switch
                checked={settings.doubleAfterSplit}
                onCheckedChange={(v) => setSettings(s => ({ ...s, doubleAfterSplit: v }))}
              />
            </div>

            {/* Allow Surrender */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Allow Surrender</Label>
                <p className="text-xs text-muted-foreground">Late surrender on initial 2 cards</p>
              </div>
              <Switch
                checked={settings.allowSurrender}
                onCheckedChange={(v) => setSettings(s => ({ ...s, allowSurrender: v }))}
              />
            </div>
          </div>

          <Separator />

          {/* Hint Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Strategy Hints
            </h4>

            {/* Show Hints */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Always Show Hints</Label>
                <p className="text-xs text-muted-foreground">Display optimal play automatically</p>
              </div>
              <Switch
                checked={settings.alwaysShowHints}
                onCheckedChange={(v) => setSettings(s => ({ ...s, alwaysShowHints: v }))}
              />
            </div>
          </div>

          <Separator />

          {/* Account & Sync */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Account & Cloud Sync
            </h4>

            {isAuthenticated && user ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.picture} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="text-success border-success/30 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Synced
                  </Badge>
                </div>

                {/* Sync Button */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex-1"
                    data-testid="settings-sync-button"
                  >
                    {syncing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    data-testid="settings-logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>

                {syncStatus.lastSync && (
                  <p className="text-xs text-muted-foreground text-center">
                    Last synced: {new Date(syncStatus.lastSync).toLocaleString()}
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Sign in to sync your progress across devices.
                </p>
                <Button
                  onClick={login}
                  className="w-full"
                  data-testid="settings-login-button"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in with Google
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Data Management
            </h4>

            {!showResetConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowResetConfirm(true)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            ) : (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Confirm Reset</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This will delete all saved stats, history, and settings. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleClearData}
                    className="flex-1"
                  >
                    Yes, Reset Everything
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset Defaults
          </Button>
          <Button onClick={handleApply} className="bg-primary hover:bg-primary/80">
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
