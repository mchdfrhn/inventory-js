import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import GradientButton from './GradientButton';

// Status styling with gradient backgrounds
const statusGradients = {
  baik: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800',
  rusak: 'from-rose-50 to-rose-100 border-rose-200 text-rose-800',
  tidak_memadai: 'from-amber-50 to-amber-100 border-amber-200 text-amber-800',
};

interface StatusConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assetCode: string;
  currentStatus: string;
  newStatus: 'baik' | 'rusak' | 'tidak_memadai';
  onStatusChange: (status: 'baik' | 'rusak' | 'tidak_memadai') => void;
  isLoading?: boolean;
}

const StatusConfirmationModal: React.FC<StatusConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assetCode,
  currentStatus,
  newStatus,
  onStatusChange,
  isLoading = false
}) => {
  const statusOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'rusak', label: 'Rusak' },
    { value: 'tidak_memadai', label: 'Tidak Memadai' },
  ];

  const formatStatusLabel = (status: string): string => {
    switch (status) {
      case 'baik': return 'Baik';
      case 'rusak': return 'Rusak';
      case 'tidak_memadai': return 'Tidak Memadai';
      default: return 'Baik';
    }
  };

  const normalizeStatus = (status: string): 'baik' | 'rusak' | 'tidak_memadai' => {
    if (status === 'baik' || status === 'rusak' || status === 'tidak_memadai') {
      return status as 'baik' | 'rusak' | 'tidak_memadai';
    }
    return 'baik';
  };

  const isStatusChanged = newStatus !== currentStatus;

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
                <div className="text-center sm:text-left">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Ubah Status Asset
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="bg-gray-50 rounded-lg p-3 border mb-3">
                      <p className="text-xs text-gray-500 mb-1">Kode Asset:</p>
                      <p className="text-sm font-medium text-gray-900">{assetCode}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Status Saat Ini:</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gradient-to-r ${statusGradients[normalizeStatus(currentStatus)]} border`}>
                        {currentStatus === 'tidak_memadai' ? 'T. Memadai' : formatStatusLabel(currentStatus)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Status Baru:
                      </label>
                        <div className="grid grid-cols-3 gap-2">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => onStatusChange(option.value as 'baik' | 'rusak' | 'tidak_memadai')}
                              className={`relative px-1.5 py-2 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                                newStatus === option.value
                                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              disabled={isLoading}
                            >
                              <div className="flex justify-center">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r ${statusGradients[normalizeStatus(option.value)]} border whitespace-nowrap`}>
                                  {option.value === 'tidak_memadai' ? 'T. Memadai' : option.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <GradientButton
                    variant="primary"
                    className="w-full sm:ml-3 sm:w-auto"
                    onClick={onConfirm}
                    disabled={!isStatusChanged || isLoading}
                    autoFocus
                  >
                    {isLoading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default StatusConfirmationModal;
