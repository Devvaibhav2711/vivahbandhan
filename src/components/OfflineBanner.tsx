import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineBanner = () => {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5">
            <WifiOff className="h-4 w-4" />
            <p>You are currently offline. Some features may be unavailable.</p>
        </div>
    );
};
