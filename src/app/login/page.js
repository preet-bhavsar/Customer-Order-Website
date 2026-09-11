'use client';

import { useState } from 'react';
import { KeyRound, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthContext will automatically redirect to '/' upon successful login
    } catch (err) {
      console.error('Login error:', err);
      // Map Firebase errors to user-friendly messages
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Failed to login. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #fed7aa 100%)',
      padding: '2rem',
      zIndex: 1000
    }}>
      {/* Dynamic Background Elements */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(249, 115, 22, 0.15)',
        borderRadius: '50%',
        top: '-10%',
        left: '-5%',
        filter: 'blur(80px)',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(249, 115, 22, 0.2)',
        borderRadius: '50%',
        bottom: '5%',
        right: '-5%',
        filter: 'blur(60px)',
        zIndex: 0
      }}></div>

      {/* Login Card */}
      <div 
        className="card" 
        style={{
          width: '100%',
          maxWidth: '440px',
          position: 'relative',
          zIndex: 1,
          padding: '3rem 2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: '1.5rem',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: 'white',
            marginBottom: '1rem',
            boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3)'
          }}>
            <KeyRound size={32} />
          </div>
          <h1 style={{ fontSize: '1.8rem', margin: '0', color: 'var(--text-main)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Sign in to Swagat Ordering</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '1rem',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '1rem',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}>
                <KeyRound size={18} />
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '0.875rem', 
              fontSize: '1rem',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
              </>
            )}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <a href="#" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
            Contact Admin
          </a>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
