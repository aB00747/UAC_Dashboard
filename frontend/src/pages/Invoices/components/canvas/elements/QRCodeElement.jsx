import { QRCodeSVG } from 'qrcode.react';
export default function QRCodeElement({ props, liveData }) {
  const value = liveData?.[props.field] || props.field || 'QR';
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: props.bgColor }}>
      <QRCodeSVG value={String(value)} fgColor={props.fgColor} bgColor={props.bgColor} size={Math.min(props.size || 80, 200)} />
    </div>
  );
}
