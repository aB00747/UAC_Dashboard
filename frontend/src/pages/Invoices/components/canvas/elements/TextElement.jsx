export default function TextElement({ props, isEditing, onContentChange }) {
  const style = {
    width: '100%', height: '100%', fontSize: props.fontSize,
    fontWeight: props.fontWeight, fontFamily: props.fontFamily,
    fontStyle: props.italic ? 'italic' : 'normal',
    color: props.color, background: props.backgroundColor,
    textAlign: props.textAlign, letterSpacing: props.letterSpacing,
    padding: props.padding, boxSizing: 'border-box',
    wordBreak: 'break-word', overflow: 'hidden',
    display: 'flex', alignItems: 'center',
  };
  if (isEditing) {
    return (
      <textarea
        autoFocus style={{ ...style, resize: 'none', border: 'none', outline: 'none' }}
        value={props.content}
        onChange={e => onContentChange(e.target.value)}
        onMouseDown={e => e.stopPropagation()}
      />
    );
  }
  return <div style={style}>{props.content}</div>;
}
