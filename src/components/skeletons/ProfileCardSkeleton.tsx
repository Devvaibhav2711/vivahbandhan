import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileCardSkeleton = () => {
    return (
        <Card className="overflow-hidden h-full flex flex-col">
            {/* Image Skeleton */}
            <div className="relative aspect-[3/4] w-full">
                <Skeleton className="h-full w-full absolute inset-0 bg-muted" />
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 w-full">
                        {/* Name/ID and Badge */}
                        <div className="flex justify-between w-full">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                        {/* Age/Height */}
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow space-y-3">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
        </Card>
    );
};
