export default function BoxElement({ props }) {
  return (
    <div style={{ width: '100%', height: '100%', background: props.backgroundColor, border: `${props.borderWidth}px ${props.borderStyle} ${props.borderColor}`, borderRadius: props.borderRadius, opacity: props.opacity, boxSizing: 'border-box' }} />
  );
}
