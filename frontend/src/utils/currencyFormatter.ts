/**
 * Utility functions for formatting and handling currency values in Indonesian Rupiah
 */

/**
 * Formats a number or string as an Indonesian currency (IDR/Rp)
 * @param value The number or string to format
 * @returns Formatted currency string with Rp symbol
 */
export const formatCurrency = (value: number | string): string => {
  if (value === undefined || value === null) return '';
  const numValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(numValue)) return '';
  
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue).replace('IDR', 'Rp');
};

/**
 * Formats a number or string as a plain number with thousand separators
 * @param value The number or string to format
 * @returns Formatted number string with thousand separators
 */
export const formatPlainNumber = (value: number | string): string => {
  if (value === undefined || value === null) return '';
  const numValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(numValue)) return '';
  
  return new Intl.NumberFormat('id-ID').format(numValue);
};

/**
 * Converts a formatted currency string back to a number
 * @param formattedValue The formatted currency string
 * @returns Numeric value
 */
export const parseCurrencyValue = (formattedValue: string): number => {
  // Remove all non-digits
  const numericString = formattedValue.replace(/\D/g, '');
  const value = parseInt(numericString, 10);
  return isNaN(value) ? 0 : value;
};

/**
 * Formats a number to Indonesian scale notation with appropriate decimal places
 * @param amount The number to format
 * @returns Formatted string with Indonesian scale notation
 */
export const formatToIndonesianScale = (amount: number): string => {
  // Handle NaN, undefined, null, or invalid numbers
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0';
  }
  
  const millions = amount / 1000000;
  const billions = millions / 1000;
  const trillions = billions / 1000;
  
  if (trillions >= 1) {
    return `${trillions.toFixed(3)} trilyun`;  // 3 digit desimal untuk trilyun
  } else if (billions >= 1) {
    return `${billions.toFixed(2)} milyar`;    // 2 digit desimal untuk milyar
  } else if (millions >= 1) {
    return `${millions.toFixed(1)} juta`;      // 1 digit desimal untuk juta
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)} ribu`;
  } else {
    return new Intl.NumberFormat('id-ID').format(Math.round(amount));
  }
};

/**
 * Converts a number to Indonesian word representation (terbilang)
 * @param num The number to convert
 * @returns String representation of the number in Indonesian
 */
export const numberToIndonesianWords = (num: number): string => {
  if (num === 0) return 'nol rupiah';
  
  const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  const scales = ['', 'ribu', 'juta', 'miliar', 'triliun'];

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    else if (n < 12) return units[n] + ' ';
    else if (n < 20) return units[n - 10] + ' belas ';
    else if (n < 100) {
      return units[Math.floor(n / 10)] + ' puluh ' + convertLessThanOneThousand(n % 10);
    } else {
      return (n < 200 ? 'seratus ' : units[Math.floor(n / 100)] + ' ratus ') + convertLessThanOneThousand(n % 100);
    }
  };

  let result = '';
  const digitGroups: number[] = [];
  
  // Split the number into groups of 3 digits
  let n = num;
  while (n > 0) {
    digitGroups.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  
  // Process each group
  for (let i = 0; i < digitGroups.length; i++) {
    const group = digitGroups[i];
    if (group !== 0) {
      // Special case for thousands
      const prefix = i === 1 && group === 1 ? 'se' : convertLessThanOneThousand(group);
      result = prefix + scales[i] + ' ' + result;
    }
  }
  
  return result.trim() + ' rupiah';
};
