// Auth Dialog Component - User authentication UI
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/authContext';
import { fullSync, getSyncStatus } from '@/lib/syncService';
import { 
  LogIn, 
  LogOut, 
  User, 
  RefreshCw, 
  Cloud, 
  CloudOff,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export function AuthDialog({ open, onOpenChange }) {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const handleLogin = () => {
    login();
  };

  const handleLogout = async () => {
    await logout();
    onOpenChange(false);
    toast.success('Logged out successfully');
  };

  const handleSync = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to sync');
      return;
    }

    setSyncing(true);
    try {
      const result = await fullSync();
      setLastSyncResult(result);
      
      if (result.success) {
        toast.success('Data synced successfully!');
      } else {
        toast.error(`Sync failed: ${result.reason}`);
      }
    } catch (error) {
      toast.error('Sync failed: ' + error.message);
      setLastSyncResult({ success: false, reason: error.message });
    } finally {
      setSyncing(false);
    }
  };

  const syncStatus = getSyncStatus();

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-sm">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm" data-testid="auth-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-primary flex items-center gap-2">
            <User className="w-5 h-5" />
            Account
          </DialogTitle>
          <DialogDescription>
            {isAuthenticated 
              ? 'Manage your account and sync data across devices'
              : 'Sign in to sync your progress across devices'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isAuthenticated && user ? (
            <>
              {/* User Profile */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                <Badge variant="outline" className="text-success border-success/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Signed In
                </Badge>
              </div>

              <Separator />

              {/* Sync Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Cloud Sync
                </h4>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    {syncStatus.inProgress || syncing ? (
                      <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                    ) : lastSyncResult?.success ? (
                      <Cloud className="w-4 h-4 text-success" />
                    ) : lastSyncResult?.success === false ? (
                      <CloudOff className="w-4 h-4 text-destructive" />
                    ) : (
                      <Cloud className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {syncing ? 'Syncing...' : 
                       syncStatus.lastSync ? `Last sync: ${new Date(syncStatus.lastSync).toLocaleTimeString()}` :
                       'Not synced yet'}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSync}
                    disabled={syncing}
                    data-testid="sync-button"
                  >
                    {syncing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>

                {syncStatus.queuedOperations > 0 && (
                  <div className="flex items-center gap-2 text-sm text-warning">
                    <AlertCircle className="w-4 h-4" />
                    <span>{syncStatus.queuedOperations} operations pending (offline)</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Syncing saves your game stats, strategy performance, and hand history to the cloud.
                  Data is automatically merged when you sign in on another device.
                </p>
              </div>

              <Separator />

              {/* Logout */}
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              {/* Sign In Prompt */}
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Cloud className="w-8 h-8 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Sync Your Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign in with Google to save your stats and continue your training on any device.
                  </p>
                </div>

                <div className="space-y-2 text-left p-3 rounded-lg bg-muted/30">
                  <p className="text-sm font-medium text-foreground">Benefits:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-success" />
                      Save game statistics across devices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-success" />
                      Track strategy performance over time
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-success" />
                      Keep your hand history backed up
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full bg-primary hover:bg-primary/80"
                  data-testid="login-button"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in with Google
                </Button>

                <p className="text-xs text-muted-foreground">
                  Your local data will be preserved and merged with your cloud data.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthDialog;
