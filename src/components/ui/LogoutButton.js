'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // AuthContext handles redirect to /login automatically
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="btn btn-secondary"
      style={{ marginLeft: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}
