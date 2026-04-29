import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import PropTypes from 'prop-types';
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';

// ── Canvas helper — extracts the cropped pixels from an image ──────────────
async function getCroppedBlob(imageSrc, pixelCrop, rotation = 0) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2);

  const data = ctx.getImageData(0, 0, safeArea, safeArea);
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ImageCropModal({ imageSrc, aspect = 1, title = 'Crop Image', onConfirm, onCancel }) {
  const [crop, setCrop]             = useState({ x: 0, y: 0 });
  const [zoom, setZoom]             = useState(1);
  const [rotation, setRotation]     = useState(0);
  const [croppedArea, setCroppedArea] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, pixels) => setCroppedArea(pixels), []);

  async function handleConfirm() {
    if (!croppedArea) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea, rotation);
      const previewUrl = URL.createObjectURL(blob);
      onConfirm(blob, previewUrl);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="u-bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold u-text">{title}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:u-bg-subtle u-text-3 hover:u-text transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative" style={{ height: 340, background: '#111' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: { border: '2px solid var(--brand-primary)' },
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <button onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="p-1.5 rounded-lg u-bg-subtle u-text-2 hover:opacity-80">
              <ZoomOut className="h-4 w-4" />
            </button>
            <input
              type="range" min={1} max={3} step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[var(--brand-primary)]"
            />
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="p-1.5 rounded-lg u-bg-subtle u-text-2 hover:opacity-80">
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="text-xs u-text-3 w-8 text-right">{zoom.toFixed(1)}x</span>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-3">
            <RotateCcw className="h-4 w-4 u-text-3 shrink-0" />
            <input
              type="range" min={-180} max={180} step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="flex-1 accent-[var(--brand-primary)]"
            />
            <span className="text-xs u-text-3 w-10 text-right">{rotation}°</span>
            <button onClick={() => setRotation(0)} className="text-xs u-text-brand hover:underline">Reset</button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-5 pb-5">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm u-text-2 u-bg-subtle hover:opacity-80">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Check className="h-4 w-4" />
            {processing ? 'Processing…' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}

ImageCropModal.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  aspect:   PropTypes.number,
  title:    PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel:  PropTypes.func.isRequired,
};
