import { useRef } from 'react';

export default function ImageElement({ props, onUpload }) {
  const inputRef = useRef();
  const style = { width: '100%', height: '100%', background: props.backgroundColor, borderRadius: props.borderRadius, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  if (!props.src) {
    return (
      <div style={{ ...style, border: '1.5px dashed #c96442', cursor: 'pointer', flexDirection: 'column', gap: 4 }}
           onClick={() => inputRef.current?.click()}>
        <span style={{ fontSize: 20 }}>🖼</span>
        <span style={{ fontSize: 9, color: '#87867f' }}>Click to upload</span>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
               onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => onUpload(ev.target.result); r.readAsDataURL(f); } }} />
      </div>
    );
  }
  return <div style={style}><img src={props.src} alt="" style={{ width: '100%', height: '100%', objectFit: props.objectFit, borderRadius: props.borderRadius }} /></div>;
}
