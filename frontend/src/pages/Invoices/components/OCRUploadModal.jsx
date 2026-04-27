import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OCRUploadModal({ onResult, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | ocr | ai | done
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }

  async function handleParse() {
    if (!file) return;
    setStatus('ocr');
    setProgress(0);
    try {
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 60)); },
      });

      // tesseract.js v7: only data.text is reliably populated (tsv/hocr/words are null).
      // Build synthetic word blocks from the plain text with approximate line/word positions.
      const rawText = (data.text ?? '').trim();
      if (!rawText) throw new Error('No text detected in the image. Try a clearer scan.');

      const blocks = [];
      const lineHeight = 20;
      const charWidth = 8;
      rawText.split('\n').forEach((line, lineIdx) => {
        const words = line.trim().split(/\s+/).filter(Boolean);
        let xCursor = 10;
        words.forEach(word => {
          blocks.push({
            text: word,
            x: xCursor,
            y: 10 + lineIdx * lineHeight,
            width: word.length * charWidth,
            height: lineHeight - 2,
            confidence: data.confidence ?? 90,
          });
          xCursor += word.length * charWidth + 6;
        });
      });

      if (blocks.length === 0) throw new Error('No text detected in the image. Try a clearer scan.');

      setStatus('ai');
      setProgress(65);

      const res = await fetch('http://localhost:8001/ocr/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_blocks: blocks,
          page_width: 794,
          page_height: 1123,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`AI parsing failed: ${errBody.detail || res.status}`);
      }
      const parsed = await res.json();
      setProgress(100);
      setStatus('done');
      onResult(parsed);
    } catch (err) {
      console.error(err);
      toast.error(`OCR failed: ${err.message}`);
      setStatus('idle');
    }
  }

  const statusMsg = { idle: '', ocr: `Running OCR… ${progress}%`, ai: 'Mapping fields with Ollama…', done: 'Done!' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#faf9f5', borderRadius: 12, padding: 24, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontFamily: 'Georgia,serif', color: '#141413' }}>Upload Invoice Image (OCR)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#87867f' }}><X size={18} /></button>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
          style={{ border: '2px dashed #e8c4b0', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer', background: preview ? '#f0eee6' : 'white', marginBottom: 16, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          {preview ? (
            <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }} />
          ) : (
            <>
              <div style={{ fontSize: 32 }}>📄</div>
              <div style={{ fontSize: 13, color: '#5e5d59' }}>Click or drag & drop an invoice image</div>
              <div style={{ fontSize: 11, color: '#87867f' }}>PNG, JPG accepted</div>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
        </div>

        {status !== 'idle' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: '#f0eee6', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ background: '#c96442', height: '100%', width: `${progress}%`, transition: 'width .3s', borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 11, color: '#5e5d59' }}>{statusMsg[status]}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#f0eee6', border: '1px solid #e8e6dc', color: '#4d4c48', padding: '6px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleParse} disabled={!file || status !== 'idle'}
            style={{ background: '#c96442', border: 'none', color: '#faf9f5', padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: (!file || status !== 'idle') ? .5 : 1 }}>
            {status === 'idle' ? 'Parse this document' : 'Processing…'}
          </button>
        </div>
      </div>
    </div>
  );
}
