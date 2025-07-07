import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Asset } from '../services/api';
import AssetDetailView from './AssetDetailView';
import GlassCard from './GlassCard';

interface AssetDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

const AssetDetailPopup: React.FC<AssetDetailPopupProps> = ({ isOpen, onClose, asset }) => {
  if (!asset) return null;

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
                  <div className="px-3 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-md border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-blue-500/20 rounded-lg">
                          <DocumentMagnifyingGlassIcon className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>
                          <Dialog.Title as="h3" className="text-sm font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Detail Aset
                          </Dialog.Title>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/20 p-1 transition-all duration-200 hover:scale-105"
                        onClick={onClose}
                      >
                        <span className="sr-only">Tutup</span>
                        <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Content with optimized scroll */}
                  <div className="max-h-[calc(80vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <AssetDetailView asset={asset} />
                  </div>

                  {/* Enhanced Footer */}
                  <div className="px-3 py-2 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-md border-t border-white/20">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white/80 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-3 w-3 mr-1" />
                        Tutup
                      </button>
                    </div>
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
