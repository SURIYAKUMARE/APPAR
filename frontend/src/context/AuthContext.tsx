import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  tempToken: string | null;
  login: (identifier: string, pass: string) => Promise<{ requiresMfa: boolean; role: string }>;
  verifyMfa: (code: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
}

const DEMO_USERS: Record<UserRole, User> = {
  SUPER_ADMIN: {
    id: 1,
    username: 'aicte_admin',
    email: 'admin@aicte-india.org',
    full_name: 'Dr. Anil Sahasrabudhe (AICTE HQ)',
    role: 'SUPER_ADMIN',
    is_active: true,
    mfa_enabled: true
  },
  REGULATION_OFFICER: {
    id: 2,
    username: 'regulation_officer',
    email: 'regulation@aicte-india.org',
    full_name: 'Smt. Mamta Rani (Bureau Chief)',
    role: 'REGULATION_OFFICER',
    is_active: true,
    mfa_enabled: true
  },
  STATE_NODAL_OFFICER: {
    id: 3,
    username: 'state_nodal_dl',
    email: 'nodal.delhi@aicte-india.org',
    full_name: 'Shri Rajesh Mehra (State Nodal - Delhi)',
    role: 'STATE_NODAL_OFFICER',
    state: 'Delhi',
    is_active: true,
    mfa_enabled: true
  },
  INSTITUTION_ADMIN: {
    id: 4,
    username: 'inst_admin_101',
    email: 'registrar@ditar.edu.in',
    full_name: 'Prof. S. K. Narayanan (Registrar)',
    role: 'INSTITUTION_ADMIN',
    institution_id: 'INST-AICTE-101',
    is_active: true,
    mfa_enabled: true
  },
  ADMISSION_OFFICER: {
    id: 5,
    username: 'admission_officer_101',
    email: 'admissions@ditar.edu.in',
    full_name: 'Dr. Ritu Saxena (Dean Admissions)',
    role: 'ADMISSION_OFFICER',
    institution_id: 'INST-AICTE-101',
    is_active: true,
    mfa_enabled: true
  },
  STUDENT: {
    id: 6,
    username: 'student_demo',
    email: 'aarav.sharma2026@student.edu.in',
    full_name: 'Aarav Sharma',
    role: 'STUDENT',
    institution_id: 'INST-AICTE-101',
    is_active: true,
    mfa_enabled: false
  },
  EXTERNAL_VERIFIER: {
    id: 7,
    username: 'tcs_verifier',
    email: 'bgv.desk@tcs-enterprise.com',
    full_name: 'Vikram Sen (Senior BGV Specialist)',
    role: 'EXTERNAL_VERIFIER',
    is_active: true,
    mfa_enabled: false
  },
  AUDITOR: {
    id: 8,
    username: 'aicte_auditor',
    email: 'cag.auditor@gov.in',
    full_name: 'Sunil Kaushik (CAG Principal Auditor)',
    role: 'AUDITOR',
    is_active: true,
    mfa_enabled: true
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('apaar_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.SUPER_ADMIN; // Default demo super admin
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('apaar_token') || 'demo-admin-token');
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  const role: UserRole = user ? user.role : 'SUPER_ADMIN';

  useEffect(() => {
    if (user) {
      localStorage.setItem('apaar_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('apaar_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('apaar_token', token);
    } else {
      localStorage.removeItem('apaar_token');
    }
  }, [token]);

  const login = async (identifier: string, pass: string): Promise<{ requiresMfa: boolean; role: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username_or_email: identifier, password: pass })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      if (data.requires_mfa) {
        setMfaRequired(true);
        setTempToken(data.temp_session_token);
        return { requiresMfa: true, role: data.role };
      } else {
        setToken(data.access_token);
        // fetch me
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${data.access_token}` }
        });
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData);
        }
        return { requiresMfa: false, role: data.role };
      }
    } catch (err: any) {
      // Offline fallback: check demo credentials
      for (const key of Object.keys(DEMO_USERS) as UserRole[]) {
        const u = DEMO_USERS[key];
        if (u.username === identifier || u.email === identifier) {
          setUser(u);
          setToken(`demo-offline-token-${u.role}`);
          return { requiresMfa: false, role: u.role };
        }
      }
      throw err;
    }
  };

  const verifyMfa = async (code: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_session_token: tempToken || '', otp_code: code })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'MFA Verification failed');
      }

      const data = await response.json();
      setToken(data.access_token);
      setMfaRequired(false);
      setTempToken(null);

      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      if (meRes.ok) {
        const userData = await meRes.json();
        setUser(userData);
      }
    } catch (err) {
      // If demo code 123456
      if (code === '123456') {
        setMfaRequired(false);
        setTempToken(null);
        setToken('demo-verified-mfa-token');
        return;
      }
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setMfaRequired(false);
    setTempToken(null);
    localStorage.removeItem('apaar_token');
    localStorage.removeItem('apaar_user');
  };

  const switchDemoRole = (newRole: UserRole) => {
    const demoUser = DEMO_USERS[newRole];
    setUser(demoUser);
    setToken(`demo-token-${newRole}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user && !!token,
        mfaRequired,
        tempToken,
        login,
        verifyMfa,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
