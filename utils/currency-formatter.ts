/**
 * Enhanced currency formatting utilities for SneakLab dashboard
 */

export function formatEuro(amount: number): string {
  // Ensure we have a valid number
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  
  // Force Euro formatting regardless of user locale
  return `€${validAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

export function formatCurrencyPortuguese(amount: number): string {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  
  try {
    // Try Portuguese locale formatting
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(validAmount)
  } catch (error) {
    console.error('Currency formatting error:', error)
    return formatEuro(validAmount)
  }
}

export function formatCurrencyAlternative(amount: number): string {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  
  // European number format: 1.234.567,89 €
  const parts = validAmount.toFixed(2).split('.')
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const decimalPart = parts[1]
  
  return `${integerPart},${decimalPart} €`
}

export function debugCurrencyFormatting(amount: number) {
  console.group('🔍 Currency Formatting Debug')
  console.log('Input amount:', amount)
  console.log('Type:', typeof amount)
  console.log('Is valid number:', typeof amount === 'number' && !isNaN(amount))
  console.log('formatEuro result:', formatEuro(amount))
  console.log('formatCurrencyPortuguese result:', formatCurrencyPortuguese(amount))
  console.log('formatCurrencyAlternative result:', formatCurrencyAlternative(amount))
  console.groupEnd()
}
