import React, { useState } from 'react';
import { 
  HeartIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import BrandingWatermark from './BrandingWatermark';

interface AppCreditsProps {
  className?: string;
  expandable?: boolean;
}

const AppCredits: React.FC<AppCreditsProps> = ({ 
  className = '', 
  expandable = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentYear = new Date().getFullYear();

  const basicInfo = (
    <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
      <BrandingWatermark variant="minimal" />
    </div>
  );

  const expandedInfo = (
    <div className="space-y-4 text-xs text-gray-500">
      {/* Main branding */}
      <div className="text-center">
        <BrandingWatermark variant="signature" />
      </div>
      
      {/* Detailed information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200/50">
        <div className="flex items-center gap-2">
          <BuildingOfficeIcon className="h-4 w-4 text-blue-500" />
          <div>
            <div className="font-medium text-gray-700">Application</div>
            <div className="text-gray-500">STTPU Inventory System</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-purple-500" />
          <div>
            <div className="font-medium text-gray-700">Developer</div>
            <div className="text-gray-500">Mochammad Farhan Ali</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-green-500" />
          <div>
            <div className="font-medium text-gray-700">Year</div>
            <div className="text-gray-500">{currentYear}</div>
          </div>
        </div>
      </div>
      
      {/* Technology stack */}
      <div className="pt-3 border-t border-gray-200/50">
        <div className="text-center">
          <div className="font-medium text-gray-700 mb-2">Built with</div>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">React</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md">TypeScript</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md">Tailwind CSS</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md">Go</span>
          </div>
        </div>
      </div>
      
      {/* Footer message */}
      <div className="text-center pt-3 border-t border-gray-200/50">
        <div className="flex items-center justify-center gap-1">
          <span>Made with</span>
          <HeartIcon className="h-3 w-3 text-red-500 fill-current" />
          <span>for STTPU</span>
        </div>
      </div>
    </div>
  );

  if (!expandable) {
    return (
      <div className={`bg-white/50 backdrop-blur-sm border-t border-gray-200/50 py-4 px-6 ${className}`}>
        {basicInfo}
      </div>
    );
  }

  return (
    <div className={`bg-white/50 backdrop-blur-sm border-t border-gray-200/50 ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {basicInfo}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 p-1 rounded-md hover:bg-gray-100/50 transition-colors duration-200"
            title={isExpanded ? "Show less" : "Show more"}
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            {expandedInfo}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppCredits;
