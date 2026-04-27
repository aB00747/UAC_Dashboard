// ---------------------------------------------------------------------------
// Indian number → words converter
// ---------------------------------------------------------------------------

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const tensWords = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function below100(n) {
  if (n < 20) return ones[n];
  return tensWords[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
}

function below1000(n) {
  if (n < 100) return below100(n);
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + below100(n % 100) : '');
}

function convertPositive(n) {
  if (n === 0) return 'Zero';
  if (n < 1000) return below1000(n);
  if (n < 100000)
    return below1000(Math.floor(n / 1000)) + ' Thousand' +
      (n % 1000 ? ' ' + below1000(n % 1000) : '');
  if (n < 10000000)
    return below1000(Math.floor(n / 100000)) + ' Lakh' +
      (n % 100000 ? ' ' + convertPositive(n % 100000) : '');
  return below1000(Math.floor(n / 10000000)) + ' Crore' +
    (n % 10000000 ? ' ' + convertPositive(n % 10000000) : '');
}

/**
 * Convert a rupee amount to Indian words.
 * e.g. 68985 → "Indian Rupees Sixty Eight Thousand Nine Hundred Eighty Five Only"
 */
export function amountToWords(amount) {
  const n = parseFloat(amount) || 0;
  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);
  let words = 'Indian Rupees ' + convertPositive(rupees);
  if (paise > 0) words += ' and ' + below100(paise) + ' Paise';
  return words + ' Only';
}

// ---------------------------------------------------------------------------
// Financial year helpers
// ---------------------------------------------------------------------------

/**
 * Returns the two-digit financial year string for a date.
 * April 2026 → "26-27", January 2027 → "26-27"
 */
export function getFinancialYear(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`;
}

/**
 * Build next invoice number.  e.g. (166, today) → "167/26-27"
 */
export function buildInvoiceNumber(seq, date) {
  return `${seq}/${getFinancialYear(date || new Date())}`;
}

// ---------------------------------------------------------------------------
// Tax calculation
// ---------------------------------------------------------------------------

export function calcTotals(lineItems, cgstRate, sgstRate, igstRate) {
  const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const cgst = parseFloat(((subtotal * cgstRate) / 100).toFixed(2));
  const sgst = parseFloat(((subtotal * sgstRate) / 100).toFixed(2));
  const igst = parseFloat(((subtotal * igstRate) / 100).toFixed(2));
  const grandTotal = parseFloat((subtotal + cgst + sgst + igst).toFixed(2));
  return { subtotal, cgstAmount: cgst, sgstAmount: sgst, igstAmount: igst, grandTotal };
}

// ---------------------------------------------------------------------------
// Relative time (no external deps)
// ---------------------------------------------------------------------------

export function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  return `${day}d ago`;
}
