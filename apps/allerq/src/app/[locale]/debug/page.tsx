'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        console.log('👍 Starting diagnostics...');
        
        const clientInfo = {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          origin: window.location.origin,
          pathname: window.location.pathname,
        };

        console.log('📍 Client Info:', clientInfo);

        // Test API connectivity
        console.log('🌀 Testing API connectivity...');
        
        let apiData = null;
        try {
          const apiResponse = await fetch('/api/debug');
          apiData = await apiResponse.json();
          console.log('💡 API Response:', apiData);
        } catch (apiError) {
          console.error('🚨 API Error:', apiError);
          apiData = { error: 'API not available', message: apiError.message };
        }

        // Test Firebase configuration
        let firebaseTest = null;
        try {
          // Import Firebase config dynamically
          const { auth } = await import('@/lib/firebase/config');
          firebaseTest = {
            status: 'Firebase config loaded',
            app: !!auth.app,
            currentUser: auth.currentUser
          };
        } catch (firebaseError) {
          console.error('🚨 Firebase Error:', firebaseError);
          firebaseTest = { error: 'Firebase not available', message: firebaseError.message };
        }

        setDiagnostics({
          client: clientInfo,
          api: apiData,
          firebase: firebaseTest,
          status: 'Diagnostics complete'
        });
        
      } catch (err: any) {
        console.error('❌ Diagnostics failed:', err);
        setError(err.message);
      }
    };
    
    runDiagnostics();
  }, []);

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'monospace', 
        backgroundColor: '#ffebee',
        border: '2px solid #fc8c8c'
      }}>
        <h2>🚈 DIAGNOSTIC ERROR</h2>
        <p><b>Error:</b> {error}</p>
        <p><b>Time:</b> {new Date().toISOString()}</p>
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'monospace', 
        textAlign: 'center',
        backgroundColor: '#fff9c4'
      }}>
        <h2>👍 Running Diagnostics...</h2>
        <p>Checking app configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      fontSize: '12px',
      backgroundColor: '#f0f9ff'
    }}>
      <h1>👍 APP DIAGNOSTICS</h1>
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: 'white', 
        border: '1px solid #ddd', 
        borderRadius: '5px'
      }}>
        <h3>👍 Client Information</h3>
        <p><b>URL:</b> {diagnostics.client.url}</p>
        <p><b>Origin:</b> {diagnostics.client.origin}</p>
        <p><b>Path:</b> {diagnostics.client.pathname}</p>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: diagnostics.api.error ? '#ffebee' : '#f0fdf4', 
        border: '1px solid #ddd', 
        borderRadius: '5px'
      }}>
        <h3>🌀 API Status</h3>
        <pre>{JSON.stringify(diagnostics.api, null, 2)}</pre>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: diagnostics.firebase.error ? '#ffebee' : '#f0fdf4', 
        border: '1px solid #ddd', 
        borderRadius: '5px'
      }}>
        <h3>🔥 Firebase Status</h3>
        <pre>{JSON.stringify(diagnostics.firebase, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>👍 Next Steps</h3>
        <p>1. If API is working, visit <a href="/api/debug" target="_blank">/api/debug</a></p>
        <p>2. If Firebase has errors, check environment variables</p>
        <p>3. Try the main page: <a href="/en">/en</a></p>
      </div>
    </div>
  );
}
