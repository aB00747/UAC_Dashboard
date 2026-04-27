function amountToWords(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Amount in Words';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function toWords(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n/10)] + ' ' + toWords(n % 10);
    if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred ' + toWords(n % 100);
    if (n < 100000) return toWords(Math.floor(n/1000)) + 'Thousand ' + toWords(n % 1000);
    if (n < 10000000) return toWords(Math.floor(n/100000)) + 'Lakh ' + toWords(n % 100000);
    return toWords(Math.floor(n/10000000)) + 'Crore ' + toWords(n % 10000000);
  }
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = toWords(rupees).trim() + ' Rupees';
  if (paise > 0) result += ' and ' + toWords(paise).trim() + ' Paise';
  return result + ' Only';
}

export default function AmountWordsElement({ props, liveData }) {
  const words = liveData?.grand_total ? amountToWords(liveData.grand_total) : 'Amount in Words';
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', fontSize: props.fontSize, color: props.color, background: props.backgroundColor, fontStyle: props.italic ? 'italic' : 'normal', padding: 4, boxSizing: 'border-box' }}>
      {words}
    </div>
  );
}
