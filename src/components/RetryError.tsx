import React from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RetryErrorProps {
    message?: string;
    onRetry?: () => void;
    isOffline?: boolean;
}

const RetryError: React.FC<RetryErrorProps> = ({
    message = "Something went wrong",
    onRetry,
    isOffline = false
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-lg min-h-[300px]">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                {isOffline ? (
                    <WifiOff className="w-8 h-8 text-muted-foreground" />
                ) : (
                    <RefreshCw className="w-8 h-8 text-muted-foreground" />
                )}
            </div>
            <h3 className="text-xl font-semibold mb-2">
                {isOffline ? "No Internet Connection" : "Unable to Load Data"}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
                {message}
            </p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </Button>
            )}
        </div>
    );
};

export default RetryError;
