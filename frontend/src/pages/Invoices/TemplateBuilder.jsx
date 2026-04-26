import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Canvas from './components/canvas/Canvas';
import ElementPalette from './components/canvas/ElementPalette';
import PropertiesPanel from './components/canvas/PropertiesPanel';
import { useCanvasState } from './components/canvas/useCanvasState';
import { templatesAPI } from '../../api/invoiceTemplates';
import OCRUploadModal from './components/OCRUploadModal';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

const STARTER_SCHEMAS = {
  gst_logo: {
    pageSize: { width: 794, height: 1123 }, elements: [
      { id: 's1', type: 'image', x: 12, y: 12, width: 90, height: 52, zIndex: 1, props: { src: null, objectFit: 'contain', borderRadius: 0, backgroundColor: 'transparent' } },
      { id: 's2', type: 'text', x: 112, y: 14, width: 240, height: 20, zIndex: 2, props: { content: 'Company Name', fontSize: 12, fontWeight: 'bold', fontFamily: 'Playfair Display, Georgia, serif', color: '#141413', backgroundColor: 'transparent', textAlign: 'left', letterSpacing: 0, padding: 2 } },
      { id: 's3', type: 'line', x: 8, y: 68, width: 778, height: 2, zIndex: 3, props: { color: '#c96442', thickness: 2, style: 'solid', orientation: 'horizontal' } },
      { id: 's4', type: 'text', x: 297, y: 76, width: 200, height: 22, zIndex: 4, props: { content: 'TAX INVOICE', fontSize: 12, fontWeight: 'bold', fontFamily: 'Playfair Display, Georgia, serif', color: '#c96442', backgroundColor: 'transparent', textAlign: 'center', letterSpacing: 3, padding: 2 } },
      { id: 's5', type: 'field', x: 8, y: 104, width: 200, height: 16, zIndex: 5, props: { field: 'invoice_number', label: 'Invoice No.', fontSize: 9, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' } },
      { id: 's6', type: 'field', x: 214, y: 104, width: 160, height: 16, zIndex: 5, props: { field: 'invoice_date', label: 'Date', fontSize: 9, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' } },
      { id: 's7', type: 'table', x: 8, y: 130, width: 778, height: 180, zIndex: 6, props: { headerBg: '#141413', headerColor: '#ffffff', oddRowBg: '#ffffff', evenRowBg: '#f5f4ed', borderColor: '#e8e6dc', borderWidth: 0.5, fontSize: 8, columns: ['description', 'hsn', 'qty', 'rate', 'amount'] } },
      { id: 's8', type: 'totals', x: 558, y: 322, width: 228, height: 90, zIndex: 7, props: { showCgst: true, showSgst: true, showIgst: false, grandTotalBg: '#141413', grandTotalColor: '#ffffff', rowColor: '#141413', fontSize: 9 } },
      { id: 's9', type: 'amountwords', x: 8, y: 324, width: 360, height: 22, zIndex: 7, props: { fontSize: 9, color: '#141413', backgroundColor: 'transparent', italic: true } },
    ]
  },
  challan: {
    pageSize: { width: 794, height: 1123 }, elements: [
      { id: 'c1', type: 'text', x: 12, y: 12, width: 770, height: 24, zIndex: 1, props: { content: 'CHALLAN CUM INVOICE', fontSize: 14, fontWeight: 'bold', fontFamily: 'Playfair Display, Georgia, serif', color: '#141413', backgroundColor: 'transparent', textAlign: 'center', letterSpacing: 2, padding: 2 } },
      { id: 'c2', type: 'line', x: 8, y: 40, width: 778, height: 2, zIndex: 2, props: { color: '#141413', thickness: 1.5, style: 'solid', orientation: 'horizontal' } },
      { id: 'c3', type: 'field', x: 8, y: 50, width: 200, height: 16, zIndex: 3, props: { field: 'challan_no', label: 'Challan No.', fontSize: 9, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' } },
      { id: 'c4', type: 'field', x: 8, y: 70, width: 200, height: 16, zIndex: 3, props: { field: 'vehicle_no', label: 'Vehicle No.', fontSize: 9, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' } },
      { id: 'c5', type: 'table', x: 8, y: 100, width: 778, height: 180, zIndex: 4, props: { headerBg: '#141413', headerColor: '#ffffff', oddRowBg: '#ffffff', evenRowBg: '#f5f4ed', borderColor: '#e8e6dc', borderWidth: 0.5, fontSize: 8, columns: ['description', 'hsn', 'qty', 'unit', 'rate', 'amount'] } },
      { id: 'c6', type: 'totals', x: 558, y: 290, width: 228, height: 90, zIndex: 5, props: { showCgst: true, showSgst: true, showIgst: false, grandTotalBg: '#141413', grandTotalColor: '#ffffff', rowColor: '#141413', fontSize: 9 } },
    ]
  },
  gst_einvoice: {
    pageSize: { width: 794, height: 1123 }, elements: [
      { id: 'e1', type: 'text', x: 12, y: 12, width: 600, height: 22, zIndex: 1, props: { content: 'TAX INVOICE (e-Invoice)', fontSize: 13, fontWeight: 'bold', fontFamily: 'Playfair Display, Georgia, serif', color: '#141413', backgroundColor: 'transparent', textAlign: 'left', letterSpacing: 1, padding: 2 } },
      { id: 'e2', type: 'field', x: 8, y: 40, width: 300, height: 16, zIndex: 2, props: { field: 'irn', label: 'IRN', fontSize: 8, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' } },
      { id: 'e3', type: 'field', x: 8, y: 60, width: 200, height: 16, zIndex: 2, props: { field: 'ack_no', label: 'Ack No.', fontSize: 8, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' } },
      { id: 'e4', type: 'qrcode', x: 620, y: 8, width: 80, height: 80, zIndex: 3, props: { field: 'irn', fgColor: '#141413', bgColor: '#ffffff' } },
      { id: 'e5', type: 'line', x: 8, y: 90, width: 778, height: 2, zIndex: 4, props: { color: '#c96442', thickness: 1.5, style: 'solid', orientation: 'horizontal' } },
      { id: 'e6', type: 'table', x: 8, y: 110, width: 778, height: 180, zIndex: 5, props: { headerBg: '#141413', headerColor: '#ffffff', oddRowBg: '#ffffff', evenRowBg: '#f5f4ed', borderColor: '#e8e6dc', borderWidth: 0.5, fontSize: 8, columns: ['description', 'hsn', 'qty', 'rate', 'amount'] } },
      { id: 'e7', type: 'totals', x: 558, y: 300, width: 228, height: 90, zIndex: 6, props: { showCgst: true, showSgst: true, showIgst: false, grandTotalBg: '#141413', grandTotalColor: '#ffffff', rowColor: '#141413', fontSize: 9 } },
    ]
  },
};

export default function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('Untitled Template');
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(75);
  const [snapGrid, setSnapGrid] = useState(true);
  const [gridSize, setGridSize] = useState(8);
  const [showOCR, setShowOCR] = useState(false);

  const { elements, selectedId, selected, setSelectedId, addElement, updateElement, deleteElement, bringForward, sendBackward, updateElements, undo, redo } = useCanvasState([]);

  useEffect(() => {
    if (id) loadTemplate();
  }, [id]);

  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  async function loadTemplate() {
    try {
      const { data } = await templatesAPI.get(id);
      setName(data.name);
      if (data.schema?.elements) updateElements(() => data.schema.elements);
    } catch { toast.error('Failed to load template'); }
  }

  function handleLoadStarter(key) {
    const schema = STARTER_SCHEMAS[key];
    if (!schema) return;
    updateElements(() => schema.elements.map(e => ({ ...e, props: { ...e.props } })));
    toast.success(`Loaded ${key.replace('_', ' ')} starter`);
  }

  async function generateThumbnail() {
    const canvasEl = document.querySelector('[data-canvas="true"]');
    if (!canvasEl) return '';
    try {
      const cvs = await html2canvas(canvasEl, { scale: 0.3, useCORS: true, logging: false });
      return cvs.toDataURL('image/jpeg', 0.7);
    } catch { return ''; }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const thumbnail = await generateThumbnail();
      const schema = { pageSize: { width: 794, height: 1123 }, elements };
      const payload = { name, schema, thumbnail };
      if (id) {
        await templatesAPI.update(id, payload);
        toast.success('Template saved');
      } else {
        const { data } = await templatesAPI.create(payload);
        toast.success('Template saved');
        navigate(`/invoices/templates/${data.id}`, { replace: true });
      }
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  function handleOCRResult({ elements: ocrElements }) {
    if (ocrElements?.length) {
      updateElements(() => ocrElements);
      toast.success(`${ocrElements.length} elements detected from image`);
    }
    setShowOCR(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', minHeight: 0 }}>
      {/* Toolbar */}
      <div style={{ background: '#141413', color: '#faf9f5', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #30302e', flexShrink: 0 }}>
        <button onClick={() => navigate('/invoices/templates')} style={{ background: 'none', border: 'none', color: '#c96442', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={14} /> Templates
        </button>
        <input value={name} onChange={e => setName(e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#faf9f5', fontSize: 13, fontFamily: 'Georgia, serif', fontWeight: 600, textAlign: 'center', outline: 'none' }}
          onBlur={e => { if (!e.target.value.trim()) setName('Untitled Template'); }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ color: '#5e5d59', fontSize: 9 }}>Ctrl+Z undo</span>
          <button onClick={() => setShowOCR(true)}
            style={{ background: '#30302e', border: '1px solid #3d3d3a', color: '#b0aea5', padding: '4px 10px', borderRadius: 8, fontSize: 10, cursor: 'pointer' }}>
            Upload OCR
          </button>
          <button onClick={() => setZoom(z => Math.max(50, z - 25))}
            style={{ background: '#30302e', border: '1px solid #3d3d3a', color: '#b0aea5', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>−</button>
          <span style={{ background: '#30302e', border: '1px solid #3d3d3a', color: '#b0aea5', padding: '0 8px', borderRadius: 6, fontSize: 10, display: 'flex', alignItems: 'center', minWidth: 44, justifyContent: 'center', height: 26 }}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(150, z + 25))}
            style={{ background: '#30302e', border: '1px solid #3d3d3a', color: '#b0aea5', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>+</button>
          <button onClick={handleSave} disabled={saving}
            style={{ background: '#c96442', border: 'none', color: '#faf9f5', padding: '5px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .6 : 1 }}>
            {saving ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* 3-column workspace */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ElementPalette onAddElement={addElement} onLoadStarter={handleLoadStarter} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Canvas
            elements={elements} selectedId={selectedId}
            onSelect={setSelectedId} onUpdate={updateElement}
            onDelete={deleteElement} onBringForward={bringForward} onSendBackward={sendBackward}
            snapGrid={snapGrid} gridSize={gridSize}
            liveData={null} profile={null}
            zoom={zoom}
          />
        </div>
        <div style={{ width: 195, flexShrink: 0, background: '#141413', borderLeft: '1px solid #30302e', overflowY: 'auto' }}>
          <PropertiesPanel
            element={selected} onUpdate={updateElement}
            onDelete={deleteElement} onBringForward={bringForward} onSendBackward={sendBackward}
            snapGrid={snapGrid} onSnapChange={() => setSnapGrid(v => !v)}
            gridSize={gridSize} onGridSizeChange={setGridSize}
          />
        </div>
      </div>

      {showOCR && <OCRUploadModal onResult={handleOCRResult} onClose={() => setShowOCR(false)} />}
    </div>
  );
}
