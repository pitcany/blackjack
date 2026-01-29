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
import { defaultConfig } from '@/lib/gameLogic';

export function SettingsDialog({ open, onOpenChange, config, onApply }) {
  const [settings, setSettings] = useState(config);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">Game Settings</DialogTitle>
          <DialogDescription>
            Customize your Blackjack game rules. Changes will start a new session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          {/* Double After Split */}
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Double After Split</Label>
            <Switch
              checked={settings.doubleAfterSplit}
              onCheckedChange={(v) => setSettings(s => ({ ...s, doubleAfterSplit: v }))}
            />
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
