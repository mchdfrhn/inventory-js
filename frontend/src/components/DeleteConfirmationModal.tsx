import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
      setIsValid(false);
    }
  }, [isOpen]);

  // Check if confirmation text is valid
  useEffect(() => {
    setIsValid(confirmText.toLowerCase() === 'yes');
  }, [confirmText]);

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
                  <p className="text-sm text-gray-700 mb-4">
                    Apakah Anda yakin ingin menghapus{' '}
                    <span className="font-semibold">"{assetName}"</span>
                    {isBulkAsset && bulkCount > 1 && 
                      ` dan semua ${bulkCount} item dalam bulk ini`
                    }?
                  </p>
                  
                  {isBulkAsset && bulkCount > 1 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-800">
                        <strong>⚠️ PERINGATAN:</strong> Menghapus bulk asset akan menghapus semua {bulkCount} item sekaligus! 
                        Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  )}

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

                  <p className="text-xs text-gray-500">
                    Tindakan ini tidak dapat dibatalkan. Semua data asset akan hilang permanen.
                  </p>
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
                      `Hapus ${isBulkAsset && bulkCount > 1 ? `${bulkCount} Asset` : 'Asset'}`
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeleteConfirmationModal;
