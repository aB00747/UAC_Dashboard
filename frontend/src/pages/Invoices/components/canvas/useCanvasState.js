import { useState, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';

const MAX_HISTORY = 20;

function cloneElements(elements) {
  return elements.map(e => ({ ...e, props: { ...e.props } }));
}

export function useCanvasState(initialElements = []) {
  const [elements, setElements] = useState(initialElements);
  const [selectedId, setSelectedId] = useState(null);
  const historyRef = useRef([initialElements]);
  const historyIdx = useRef(0);

  const pushHistory = useCallback((elems) => {
    const trimmed = historyRef.current.slice(0, historyIdx.current + 1);
    trimmed.push(cloneElements(elems));
    if (trimmed.length > MAX_HISTORY) trimmed.shift();
    historyRef.current = trimmed;
    historyIdx.current = trimmed.length - 1;
  }, []);

  const updateElements = useCallback((updater) => {
    setElements(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const addElement = useCallback((type, x = 40, y = 40) => {
    const defaults = {
      text:        { content: 'Text', fontSize: 11, fontWeight: 'normal', fontFamily: 'sans-serif', color: '#141413', backgroundColor: 'transparent', textAlign: 'left', letterSpacing: 0, padding: 4 },
      field:       { field: 'invoice_number', label: 'Invoice No.', fontSize: 10, fontWeight: 'normal', color: '#141413', backgroundColor: 'transparent', textAlign: 'left' },
      image:       { src: null, objectFit: 'contain', borderRadius: 0, backgroundColor: 'transparent' },
      table:       { headerBg: '#141413', headerColor: '#ffffff', oddRowBg: '#ffffff', evenRowBg: '#f5f4ed', borderColor: '#e8e6dc', borderWidth: 0.5, fontSize: 8, columns: ['description','hsn','qty','rate','amount'] },
      totals:      { showCgst: true, showSgst: true, showIgst: false, grandTotalBg: '#141413', grandTotalColor: '#ffffff', rowColor: '#141413', fontSize: 9 },
      amountwords: { fontSize: 9, color: '#141413', backgroundColor: 'transparent', italic: true },
      bankdetails: { fontSize: 9, labelColor: '#5e5d59', valueColor: '#141413', backgroundColor: '#faf9f5', border: '1px solid #e8e6dc' },
      qrcode:      { field: 'invoice_number', fgColor: '#141413', bgColor: '#ffffff' },
      box:         { backgroundColor: '#f5f4ed', borderColor: '#e8e6dc', borderWidth: 1, borderStyle: 'solid', borderRadius: 0, opacity: 1 },
      line:        { color: '#141413', thickness: 1, style: 'solid', orientation: 'horizontal' },
    };
    const sizes = {
      text: { w: 200, h: 28 }, field: { w: 200, h: 20 }, image: { w: 120, h: 60 },
      table: { w: 754, h: 160 }, totals: { w: 200, h: 80 }, amountwords: { w: 350, h: 20 },
      bankdetails: { w: 280, h: 70 }, qrcode: { w: 80, h: 80 },
      box: { w: 200, h: 80 }, line: { w: 754, h: 2 },
    };
    const id = nanoid(8);
    const { w, h } = sizes[type] || { w: 150, h: 40 };
    const el = { id, type, x, y, width: w, height: h, zIndex: Date.now(), props: { ...defaults[type] } };
    updateElements(prev => [...prev, el]);
    setSelectedId(id);
    return id;
  }, [updateElements]);

  const updateElement = useCallback((id, changes) => {
    updateElements(prev => prev.map(e => {
      if (e.id !== id) return e;
      const { props: propChanges, ...rest } = changes;
      return { ...e, ...rest, props: propChanges ? { ...e.props, ...propChanges } : e.props };
    }));
  }, [updateElements]);

  const deleteElement = useCallback((id) => {
    updateElements(prev => prev.filter(e => e.id !== id));
    setSelectedId(null);
  }, [updateElements]);

  const bringForward = useCallback((id) => {
    updateElements(prev => prev.map(e => e.id === id ? { ...e, zIndex: e.zIndex + 1 } : e));
  }, [updateElements]);

  const sendBackward = useCallback((id) => {
    updateElements(prev => prev.map(e => e.id === id ? { ...e, zIndex: Math.max(1, e.zIndex - 1) } : e));
  }, [updateElements]);

  const undo = useCallback(() => {
    if (historyIdx.current <= 0) return;
    historyIdx.current -= 1;
    setElements(cloneElements(historyRef.current[historyIdx.current]));
    setSelectedId(null);
  }, []);

  const redo = useCallback(() => {
    if (historyIdx.current >= historyRef.current.length - 1) return;
    historyIdx.current += 1;
    setElements(cloneElements(historyRef.current[historyIdx.current]));
    setSelectedId(null);
  }, []);

  const selected = elements.find(e => e.id === selectedId) || null;

  return { elements, selectedId, selected, setSelectedId, addElement, updateElement, deleteElement, bringForward, sendBackward, updateElements, undo, redo };
}
