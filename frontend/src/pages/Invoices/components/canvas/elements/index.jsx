import TextElement from './TextElement';
import DataFieldElement from './DataFieldElement';
import ImageElement from './ImageElement';
import TableElement from './TableElement';
import TotalsElement from './TotalsElement';
import AmountWordsElement from './AmountWordsElement';
import BankDetailsElement from './BankDetailsElement';
import QRCodeElement from './QRCodeElement';
import BoxElement from './BoxElement';
import LineElement from './LineElement';

export default function ElementRenderer({ element, liveData, profile, isEditing, onContentChange, onUpload }) {
  const p = element.props;
  switch (element.type) {
    case 'text':        return <TextElement props={p} isEditing={isEditing} onContentChange={onContentChange} />;
    case 'field':       return <DataFieldElement props={p} liveData={liveData} />;
    case 'image':       return <ImageElement props={p} onUpload={onUpload} />;
    case 'table':       return <TableElement props={p} liveData={liveData} />;
    case 'totals':      return <TotalsElement props={p} liveData={liveData} />;
    case 'amountwords': return <AmountWordsElement props={p} liveData={liveData} />;
    case 'bankdetails': return <BankDetailsElement props={p} profile={profile} />;
    case 'qrcode':      return <QRCodeElement props={p} liveData={liveData} />;
    case 'box':         return <BoxElement props={p} />;
    case 'line':        return <LineElement props={p} />;
    default:            return <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#888' }}>{element.type}</div>;
  }
}
