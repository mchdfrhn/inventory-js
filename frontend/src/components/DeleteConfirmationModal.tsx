import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import GradientButton from './GradientButton';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assetName: string;
  isBulkAsset?: boolean;
  bulkCount?: number;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assetName,
  isBulkAsset = false,
  bulkCount = 1,
  isLoading = false
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      // Set initial validity based on asset type
      if (isBulkAsset && bulkCount > 1) {
        setIsValid(false); // Bulk assets need confirmation
      } else {
        setIsValid(true); // Regular assets are always valid
      }
    }
  }, [isOpen, isBulkAsset, bulkCount]);

  // Check if confirmation text is valid (only for bulk assets)
  useEffect(() => {
    if (isBulkAsset && bulkCount > 1) {
      setIsValid(confirmText.toLowerCase() === 'yes');
    } else {
      setIsValid(true); // For regular assets, always valid
    }
  }, [confirmText, isBulkAsset, bulkCount]);

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !isLoading) {
      handleConfirm();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {isBulkAsset && bulkCount > 1 ? (
                  // Bulk asset - keep current layout
                  <>
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          Hapus Asset
                        </Dialog.Title>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Apakah Anda yakin ingin menghapus{' '}
                        <span className="font-semibold">"{assetName}"</span>
                        {` dan semua ${bulkCount} item dalam bulk ini`}?
                      </p>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-800">
                          <strong>⚠️ PERINGATAN:</strong> Menghapus bulk asset akan menghapus semua {bulkCount} item sekaligus! 
                          Tindakan ini tidak dapat dibatalkan.
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700 mb-2">
                          Untuk melanjutkan, ketik <strong className="text-red-600">yes</strong> di bawah ini:
                        </p>
                        <input
                          type="text"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ketik 'yes' untuk konfirmasi"
                          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isValid
                              ? 'border-green-300 focus:ring-green-500 bg-green-50'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          disabled={isLoading}
                          autoFocus
                        />
                        {confirmText && !isValid && (
                          <p className="text-xs text-red-600 mt-1">
                            Ketik "yes" (tanpa tanda kutip) untuk melanjutkan
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <button
                        type="button"
                        className="flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        className={`flex-1 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                          isValid
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        onClick={handleConfirm}
                        disabled={!isValid || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menghapus...
                          </>
                        ) : (
                          `Hapus ${bulkCount} Asset`
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  // Regular asset - use exactly same layout as Categories/Locations
                  <>
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                          Hapus Asset
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Apakah Anda yakin ingin menghapus{' '}
                            <span className="font-semibold">"{assetName}"</span>?{' '}
                            Tindakan ini tidak dapat dibatalkan.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <GradientButton
                        variant="danger"
                        className="w-full sm:ml-3 sm:w-auto"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        autoFocus
                      >
                        {isLoading && (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {isLoading ? 'Menghapus...' : 'Hapus'}
                      </GradientButton>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200 hover:-translate-y-0.5"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Batal
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeleteConfirmationModal;
