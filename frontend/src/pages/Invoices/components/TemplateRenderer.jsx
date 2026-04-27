import ElementRenderer from './canvas/elements/index';

const A4_W = 794;
const A4_H = 1123;

export default function TemplateRenderer({ schema, invoiceData, profile, scale = 0.5 }) {
  if (!schema?.elements?.length) {
    return (
      <div style={{ width: A4_W * scale, height: A4_H * scale, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#87867f', fontSize: 12, border: '1px solid #e8e6dc' }}>
        No template selected
      </div>
    );
  }

  const sorted = [...schema.elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  return (
    <div
      data-template-renderer="true"
      style={{ width: A4_W * scale, height: A4_H * scale, background: 'white', position: 'relative', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: A4_W, height: A4_H, position: 'absolute', top: 0, left: 0 }}>
        {sorted.map(el => (
          <div key={el.id} style={{ position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, zIndex: el.zIndex || 1 }}>
            <ElementRenderer element={el} liveData={invoiceData} profile={profile} isEditing={false} onContentChange={() => {}} onUpload={() => {}} />
          </div>
        ))}
      </div>
    </div>
  );
}
