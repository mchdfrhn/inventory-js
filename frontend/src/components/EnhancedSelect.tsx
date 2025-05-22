import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  color?: string;
  isSpecial?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface EnhancedSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  name: string;
  required?: boolean;
  helpText?: string;
  isError?: boolean;
  errorText?: string;
  disabled?: boolean;
  placeholder?: string;
  showSelectedInline?: boolean;
}

export default function EnhancedSelect({ 
  options, 
  value, 
  onChange, 
  label, 
  name, 
  required = false, 
  helpText,
  isError = false,
  errorText,
  disabled = false,
  placeholder = 'Pilih opsi',
  showSelectedInline = true
}: EnhancedSelectProps) {
  // Find the selected option or use a placeholder if no option is selected
  const selectedOption = options.find(option => option.value === value) || 
    (value === '' ? { value: '', label: placeholder, description: '' } : options[0]);
  
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Label className="block text-sm font-medium text-gray-700" id={`${name}-label`}>
            {label} {required && <span className="text-red-500 ml-0.5">*</span>}
          </Listbox.Label>
          
          <div className="mt-1 relative">
            <Listbox.Button 
              className={`relative w-full cursor-pointer rounded-md border 
                ${isError ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} 
                ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} 
                py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200`}
              aria-labelledby={`${name}-label`}
              aria-required={required}
              aria-invalid={isError}
              id={name}
            >
              <span className="flex items-center">
                {selectedOption.color && (
                  <span 
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${selectedOption.color}`}
                    aria-hidden="true"
                  />
                )}
                {selectedOption.icon && (
                  <span className="mr-2 flex items-center">
                    {selectedOption.icon}
                  </span>
                )}
                <span 
                  className={`block truncate 
                    ${selectedOption.isSpecial ? 'font-medium text-blue-600' : ''}
                    ${(value === '' || value === undefined) ? 'text-gray-400' : ''}`}
                >
                  {selectedOption.label || placeholder}
                </span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon 
                  className={`h-5 w-5 ${disabled ? 'text-gray-400' : open ? 'text-blue-600' : 'text-gray-400'}`}
                  aria-hidden="true" 
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm divide-y divide-gray-100">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-3 pr-9 transition-colors duration-150 ${
                        option.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                      } ${option.isSpecial ? 'border-t border-gray-100 mt-1 pt-3' : ''}`
                    }
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          {option.color && (
                            <span 
                              className={`inline-flex items-center justify-center w-3 h-3 rounded-full mr-2 ${option.color} ${active ? 'ring-2 ring-blue-200' : ''}`}
                              aria-hidden="true"
                            />
                          )}
                          {option.icon && (
                            <span className="mr-2 flex items-center text-gray-400">
                              {option.icon}
                            </span>
                          )}
                          <span 
                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'} 
                              ${option.isSpecial ? 'text-blue-600 font-medium' : ''} 
                              ${option.disabled ? 'text-gray-400' : ''}
                              ${option.value === '' ? 'text-gray-400 italic' : ''}`}
                          >
                            {option.label}
                          </span>
                        </div>
                        
                        {option.description && (
                          <p className="mt-0.5 ml-5 text-xs text-gray-500">{option.description}</p>
                        )}

                        {selected ? (
                          <span
                            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                              active ? 'text-blue-800' : 'text-blue-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
          
          {isError && errorText ? (
            <p className="mt-2 text-sm text-red-600 flex items-start" id={`${name}-error`}>
              <ExclamationCircleIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              {errorText}
            </p>
          ) : helpText ? (
            <p className="mt-2 text-xs text-gray-500" id={`${name}-description`}>
              {helpText}
            </p>
          ) : null}
          
          {value && !isError && showSelectedInline && name === 'category_id' && (
            <div className="mt-2 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              <span className="text-xs text-gray-600">
                {selectedOption?.label}
              </span>
            </div>
          )}
        </div>
      )}
    </Listbox>
  );
}
