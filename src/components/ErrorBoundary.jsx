import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          margin: '2rem auto',
          maxWidth: '550px',
          background: 'rgba(255, 60, 60, 0.1)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 100, 100, 0.3)',
          borderRadius: '16px',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
          <h3 style={{ margin: '0.5rem 0', color: '#ff7b7b' }}>Đã xảy ra lỗi ngoài ý muốn</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
            Ứng dụng gặp sự cố khi xử lý dữ liệu. Vui lòng tải lại hoặc thử khôi phục dữ liệu ban đầu.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
              color: '#fff',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(255, 65, 108, 0.4)'
            }}
          >
            🔄 Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
