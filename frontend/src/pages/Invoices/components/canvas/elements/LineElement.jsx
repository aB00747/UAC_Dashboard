export default function LineElement({ props }) {
  const isH = props.orientation !== 'vertical';
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: isH ? '100%' : props.thickness,
        height: isH ? props.thickness : '100%',
        borderTop: isH ? `${props.thickness}px ${props.style} ${props.color}` : 'none',
        borderLeft: !isH ? `${props.thickness}px ${props.style} ${props.color}` : 'none',
      }} />
    </div>
  );
}
