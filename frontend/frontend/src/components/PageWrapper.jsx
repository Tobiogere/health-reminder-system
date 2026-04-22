import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LoadingSpinner from './LoadingSpinner';
import useWindowSize from '../hooks/useWindowSize';

const PageWrapper = ({ children, sidebarOpen, onToggleSidebar, onCloseSidebar, loading = false, loadingMessage }) => {
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth <= 768;

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar onToggleSidebar={onToggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={onCloseSidebar} />
      <div style={{
        marginLeft: sidebarOpen && !isMobile ? '220px' : '0px',
        marginTop: '60px',
        padding: '1.5rem',
        transition: 'margin-left 0.25s ease',
      }}>
        {loading ? <LoadingSpinner message={loadingMessage} /> : children}
      </div>
    </div>
  );
};

export default PageWrapper;