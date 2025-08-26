export default function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Kitchen OS - AllerQ</h1>
      <p>Application is working!</p>
      <p>Build successful: {new Date().toISOString()}</p>
      <p className="text-sm text-gray-500 mt-2">Firebase Auth implementation ready!</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/auth/login" style={{ marginRight: '10px', color: 'blue' }}>Login</a>
        <a href="/auth/signup" style={{ color: 'blue' }}>Sign Up</a>
      </div>
    </div>
  );
}
