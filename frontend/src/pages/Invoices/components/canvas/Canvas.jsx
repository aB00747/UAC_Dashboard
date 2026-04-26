import { useRef, useState, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import ElementRenderer from './elements/index';
import FloatingToolbar from './FloatingToolbar';

const A4_W = 794;
const A4_H = 1123;

function snapTo(val, grid) {
  return grid > 1 ? Math.round(val / grid) * grid : val;
}

export default function Canvas({ elements, selectedId, onSelect, onUpdate, onDelete, onBringForward, onSendBackward, snapGrid, gridSize, liveData, profile, zoom }) {
  const [editingId, setEditingId] = useState(null);
  const canvasRef = useRef(null);
  const scale = zoom / 100;

  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.dataset.canvas) {
      onSelect(null);
      setEditingId(null);
    }
  }, [onSelect]);

  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && editingId !== selectedId) {
        onDelete(selectedId);
      }
      if (e.key === 'Escape') { onSelect(null); setEditingId(null); }
      if (!selectedId) return;
      const nudge = e.shiftKey ? 10 : 1;
      const el = elements.find(el => el.id === selectedId);
      if (!el) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); onUpdate(selectedId, { x: el.x - nudge }); }
      if (e.key === 'ArrowRight') { e.preventDefault(); onUpdate(selectedId, { x: el.x + nudge }); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); onUpdate(selectedId, { y: el.y - nudge }); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); onUpdate(selectedId, { y: el.y + nudge }); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedId, editingId, elements, onDelete, onUpdate, onSelect]);

  const sorted = [...elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  return (
    <div style={{ background: '#1e1e1c', overflow: 'auto', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20 }}>
      <div
        ref={canvasRef}
        data-canvas="true"
        onClick={handleCanvasClick}
        style={{
          position: 'relative',
          width: A4_W * scale,
          height: A4_H * scale,
          background: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,.5)',
          flexShrink: 0,
          backgroundImage: snapGrid ? 'radial-gradient(#e0ddd6 1px,transparent 1px)' : 'none',
          backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: A4_W, height: A4_H, position: 'absolute', top: 0, left: 0 }}>
          {sorted.map(el => {
            const isSelected = el.id === selectedId;
            const isEditing = el.id === editingId;
            return (
              <Rnd
                key={el.id}
                position={{ x: el.x, y: el.y }}
                size={{ width: el.width, height: el.height }}
                bounds="parent"
                onDragStop={(_, d) => {
                  const x = snapGrid ? snapTo(d.x, gridSize) : d.x;
                  const y = snapGrid ? snapTo(d.y, gridSize) : d.y;
                  onUpdate(el.id, { x: Math.max(0, Math.min(x, A4_W - el.width)), y: Math.max(0, Math.min(y, A4_H - el.height)) });
                }}
                onResizeStop={(_, __, ref, ___, pos) => {
                  onUpdate(el.id, { width: parseInt(ref.style.width), height: parseInt(ref.style.height), x: pos.x, y: pos.y });
                }}
                style={{ zIndex: el.zIndex, boxSizing: 'border-box', outline: isSelected ? '2px solid #c96442' : 'none', outlineOffset: 1 }}
                resizeHandleStyles={isSelected ? {
                  bottomRight: { width: 8, height: 8, background: '#c96442', border: '1.5px solid white', borderRadius: '50%', right: -4, bottom: -4 },
                  right: { width: 8, height: 8, background: '#c96442', border: '1.5px solid white', borderRadius: '50%', right: -4, top: '50%', transform: 'translateY(-50%)' },
                  bottom: { width: 8, height: 8, background: '#c96442', border: '1.5px solid white', borderRadius: '50%', bottom: -4, left: '50%', transform: 'translateX(-50%)' },
                  topLeft: { width: 8, height: 8, background: '#c96442', border: '1.5px solid white', borderRadius: '50%', left: -4, top: -4 },
                } : {}}
                enableResizing={isSelected}
                disableDragging={isEditing}
                onClick={e => { e.stopPropagation(); onSelect(el.id); }}
                onDoubleClick={() => { if (el.type === 'text') setEditingId(el.id); }}
              >
                {isSelected && (
                  <FloatingToolbar
                    element={el}
                    onUpdate={changes => onUpdate(el.id, changes)}
                    onDelete={() => onDelete(el.id)}
                    onShowMore={() => {}}
                  />
                )}
                <ElementRenderer
                  element={el}
                  liveData={liveData}
                  profile={profile}
                  isEditing={isEditing}
                  onContentChange={val => onUpdate(el.id, { props: { content: val } })}
                  onUpload={src => onUpdate(el.id, { props: { src } })}
                />
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
}
