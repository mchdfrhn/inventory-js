import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import type { Asset } from '../services/api';
import { assetApi } from '../services/api';
import AssetDetailView from './AssetDetailView';
import GlassCard from './GlassCard';

interface AssetDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

const AssetDetailPopup: React.FC<AssetDetailPopupProps> = ({ isOpen, onClose, asset }) => {
  // Fetch fresh data when popup opens
  const { data: freshAssetData } = useQuery({
    queryKey: ['asset-detail', asset?.id],
    queryFn: () => assetApi.getById(asset!.id),
    enabled: isOpen && !!asset?.id,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the result
  });

  console.log('AssetDetailPopup - Original asset:', asset);
  console.log('AssetDetailPopup - Fresh asset data:', freshAssetData);

  if (!asset) return null;

  // Use fresh data if available, fallback to passed asset
  const displayAsset = freshAssetData?.data || asset;
  console.log('AssetDetailPopup - Display asset:', displayAsset);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-3">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-2xl">
                <GlassCard className="overflow-hidden shadow-xl border border-white/20" hover={false}>
                  {/* Enhanced Header with Glass Morphism */}
                  <div className="px-3 py-1 bg-gradient-to-r from-gray-500/10 to-gray-500/10 backdrop-blur-md border-b border-white/10">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className="rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50/20 p-1 transition-all duration-200 hover:scale-105"
                        onClick={onClose}
                      >
                        <span className="sr-only">Tutup</span>
                        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Content with optimized scroll */}
                  <div className="max-h-[calc(80vh-60px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <AssetDetailView asset={displayAsset} />
                  </div>
                </GlassCard>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AssetDetailPopup;
