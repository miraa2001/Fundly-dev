export default function StatusMessage({ tone = 'error', children }) {
  if (!children) {
    return null;
  }

  const className = tone === 'success' ? 'message-success' : 'message-error';

  return <div className={className}>{children}</div>;
}
