import { useTranslations } from 'next-intl';

export default function SimplePage() {
  const tHome = useTranslations('home');
  const tAuth = useTranslations('auth');

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1>🎉 {tHome('title')}</h1>
      <p>{tHome('subtitle')}</p>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '10px'
      }}>
        <h2>👍 No Firebase Auth - Just Testing!</h2>
        <p>This page bypasses Firebase Auth to test basic functionality.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>🔥 Features</h3>
          <div style={{ 
            padding: '15px', 
            backgroundColor: 'white', 
            border: '1px solid #ddd', 
            borderRadius: '5px',
            marginTop: '10px'
          }}>
            <h4>📐 TQStudio</h4>
            <p>{tHome('features.qrStudio.description')}</p>
          </div>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <button 
            style={{ 
              padding: '12px 18px', 
              backgroundColor: '#007cba', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer'
            }}
            onClick={() => alert('Button works!')}
          >
            {tHome('getStarted')}
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <h3>👍 Navigation Test</h3>
        <p>
          <a href="/api/debug" target="_blank" style={{ color: '#007cba' }}>
            Test API Endpoint
          </a>
        </p>
        <p>
          <a href="/en" style={{ color: '#007cba' }}>
            Back to Main Page
          </a>
        </p>
      </div>
    </div>
  );
}
