import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '2rem', maxWidth: '400px' }}>
            An unexpected error occurred. Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#0d6efd',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1.8rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              marginBottom: '0.75rem',
            }}
          >
            🔄 Refresh Page
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--muted)',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              padding: '0.6rem 1.8rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            ← Back to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;