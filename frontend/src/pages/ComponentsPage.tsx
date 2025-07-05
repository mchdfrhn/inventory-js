import { useState } from 'react';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import Loader from '../components/Loader';

export default function ComponentsPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };
  
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          UI Components
        </h1>
        <p className="mt-1 text-sm text-gray-500">Showcase of UI components used in the inventory system</p>
      </div>
        {/* Glass Card Showcase */}
      <GlassCard hover={false} className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Glass Cards</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Card Variants</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard elevation="low" className="p-4">
                <h4 className="font-medium">Low Elevation</h4>
                <p className="text-sm text-gray-500">Subtle shadow for minimal depth</p>
              </GlassCard>
              
              <GlassCard elevation="medium" className="p-4">
                <h4 className="font-medium">Medium Elevation</h4>
                <p className="text-sm text-gray-500">Default shadow depth</p>
              </GlassCard>
              
              <GlassCard elevation="high" className="p-4">
                <h4 className="font-medium">High Elevation</h4>
                <p className="text-sm text-gray-500">More prominent shadow</p>
              </GlassCard>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Interactive States</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard interactive={true} borderGlow={true} className="p-4">
                <h4 className="font-medium">Interactive with Border Glow</h4>
                <p className="text-sm text-gray-500">Hover over this card to see the effect</p>
              </GlassCard>
              
              <GlassCard hover={false} className="p-4">
                <h4 className="font-medium">Static Card (No Hover)</h4>
                <p className="text-sm text-gray-500">Card without hover effects</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Button Showcase */}
      <GlassCard hover={false} className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Gradient Buttons</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Button Variants</h3>
            <div className="flex flex-wrap gap-4">
              <GradientButton variant="primary">Primary Button</GradientButton>
              <GradientButton variant="secondary">Secondary Button</GradientButton>
              <GradientButton variant="success">Success Button</GradientButton>
              <GradientButton variant="danger">Danger Button</GradientButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Button Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <GradientButton size="sm">Small Button</GradientButton>
              <GradientButton size="md">Medium Button</GradientButton>
              <GradientButton size="lg">Large Button</GradientButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Full Width Button</h3>
            <div className="max-w-md">
              <GradientButton fullWidth>Full Width Button</GradientButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Disabled State</h3>
            <div className="flex flex-wrap gap-4">
              <GradientButton disabled>Disabled Button</GradientButton>
              <GradientButton variant="secondary" disabled>Disabled Secondary</GradientButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">With Icon</h3>
            <div className="flex flex-wrap gap-4">
              <GradientButton>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </GradientButton>
              <GradientButton variant="success">
                Save Changes
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </GradientButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Loading State</h3>
            <div className="flex flex-wrap gap-4">
              <GradientButton onClick={simulateLoading} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Click to Load'
                )}
              </GradientButton>            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Status Badges */}
      <GlassCard hover={false} className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Status Badges</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Asset Status Indicators</h3>
            <div className="flex flex-wrap gap-4">
              <span className="status-badge available">Available</span>
              <span className="status-badge in-use">In Use</span>
              <span className="status-badge maintenance">Maintenance</span>
              <span className="status-badge disposed">Disposed</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">In Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Office Laptop</h4>
                    <p className="text-sm text-gray-500">Dell XPS 15</p>
                  </div>
                  <span className="status-badge available">Available</span>
                </div>
              </GlassCard>
              
              <GlassCard className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Conference Room Projector</h4>
                    <p className="text-sm text-gray-500">Epson PowerLite</p>
                  </div>
                  <span className="status-badge in-use">In Use</span>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
