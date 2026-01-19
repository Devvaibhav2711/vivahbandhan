
// Utility to prefetch critical routes
// This helps in loading chunk files before the user actually clicks the link

const prefetchRoutes = () => {
    const routesToPrefetch = [
        () => import('../pages/MyMatches'),
        () => import('../pages/RequestMatch'),
        () => import('../pages/SuccessStories'),
        () => import('../pages/Admin'),
        () => import('../pages/EditProfile'),
        () => import('../pages/ViewProfile'),
    ];

    // Use requestIdleCallback if available, otherwise setTimeout
    const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1));

    idleCallback(() => {
        routesToPrefetch.forEach((importFn) => {
            try {
                importFn();
            } catch (e) {
                // Ignore prefetch errors
            }
        });
    });
};

export default prefetchRoutes;
