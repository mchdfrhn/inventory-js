// Simple script to test cache clearing
// This will open dev tools and run invalidation

console.log('Cache clearing script');

// Check if we have access to React Query
if (window.queryClient) {
  console.log('Invalidating assets cache...');
  window.queryClient.invalidateQueries({ queryKey: ['assets'] });
  window.queryClient.invalidateQueries({ queryKey: ['all_assets'] });
  console.log('Cache invalidated');
} else {
  console.log('QueryClient not found in window. Try manual refresh.');
}
