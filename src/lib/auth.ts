export interface UserProfile {
  email: string;
  name: string;
  role: 'Gerente' | 'Admin';
  roleLabel: string;
  avatarUrl?: string;
}

export const AUTHORIZED_USERS: {
  email: string;
  name: string;
  role: 'Gerente' | 'Admin';
  roleLabel: string;
  password: string;
  avatarUrl: string;
}[] = [
  // Gerentes de Sucursales Experience
  {
    email: 'gerentevicentelopez@migusto.com.ar',
    name: 'Gerencia Vicente López',
    role: 'Gerente',
    roleLabel: 'Gerente Experience',
    password: 'MiGusto123.',
    avatarUrl: 'users/admin.png'
  },
  {
    email: 'gerentecañitas@migusto.com.ar',
    name: 'Gerencia Cañitas',
    role: 'Gerente',
    roleLabel: 'Gerente Experience',
    password: 'MiGusto123.',
    avatarUrl: 'users/admin.png'
  },
  {
    email: 'gerentevillacrespo@migusto.com.ar',
    name: 'Gerencia Villa Crespo',
    role: 'Gerente',
    roleLabel: 'Gerente Experience',
    password: 'MiGusto123.',
    avatarUrl: 'users/admin.png'
  },
  {
    email: 'martinsastre@migusto.com.ar',
    name: 'Martín Sastre',
    role: 'Gerente',
    roleLabel: 'Gerente Experience',
    password: 'MiGusto123',
    avatarUrl: 'users/martin.png'
  },
  {
    email: 'sashaalfini@migusto.com.ar',
    name: 'Sasha Alfini',
    role: 'Gerente',
    roleLabel: 'Gerente Experience',
    password: 'MiGusto123',
    avatarUrl: 'users/sasha.png'
  },
  {
    email: 'selenehernandez@migusto.com.ar',
    name: 'Selene Hernández',
    role: 'Gerente',
    roleLabel: 'Gerente Experience',
    password: 'MiGusto123',
    avatarUrl: 'users/selene.png'
  },

  // Administradores (Acceso total)
  {
    email: 'admin@migusto.com.ar',
    name: 'Administración Mi Gusto',
    role: 'Admin',
    roleLabel: 'Administrador General',
    password: '123MiGusto.',
    avatarUrl: 'users/admin.png'
  },
  {
    email: 'mariasalazar@migusto.com.ar',
    name: 'María Salazar',
    role: 'Admin',
    roleLabel: 'Administradora',
    password: '123MiGusto.',
    avatarUrl: 'users/maria.png'
  },
  {
    email: 'lidyatello@migusto.com.ar',
    name: 'Lidya Tello',
    role: 'Admin',
    roleLabel: 'Administradora',
    password: '123MiGusto.',
    avatarUrl: 'users/lydia.png'
  }
];

export function normalizeEmail(emailInput?: string | null): string {
  if (!emailInput) return '';
  const clean = emailInput.trim().toLowerCase();
  // Permitir login tanto con 'ñ' como con 'n' para Cañitas
  if (clean === 'gerentecanitas@migusto.com.ar') {
    return 'gerentecañitas@migusto.com.ar';
  }
  return clean;
}

export function getUserAvatarUrl(userOrEmail?: UserProfile | string | null): string | undefined {
  if (!userOrEmail) return undefined;
  const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail.email;
  const cleanEmail = normalizeEmail(email);
  const matched = AUTHORIZED_USERS.find(u => normalizeEmail(u.email) === cleanEmail);
  if (matched?.avatarUrl) return matched.avatarUrl;

  if (typeof userOrEmail !== 'string' && userOrEmail.avatarUrl) {
    return userOrEmail.avatarUrl;
  }

  const name = typeof userOrEmail !== 'string' ? (userOrEmail.name || '').toLowerCase() : '';
  if (name.includes('maría') || name.includes('maria')) return 'users/maria.png';
  if (name.includes('lidya') || name.includes('lydia')) return 'users/lydia.png';
  if (name.includes('martín') || name.includes('martin')) return 'users/martin.png';
  if (name.includes('sasha')) return 'users/sasha.png';
  if (name.includes('selene')) return 'users/selene.png';
  if (name.includes('admin') || name.includes('administración')) return 'users/admin.png';

  return 'users/admin.png';
}

export function canUserDeleteAudits(user: UserProfile | null): boolean {
  if (!user) return false;
  const email = normalizeEmail(user.email);
  return (
    email === 'admin@migusto.com.ar' ||
    email === 'mariasalazar@migusto.com.ar' ||
    email === 'lidyatello@migusto.com.ar'
  );
}

export function canUserAccessDashboard(_user?: UserProfile | null): boolean {
  return true;
}

const SESSION_KEY = 'migusto_experience_session_v1';

export function getStoredSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const profile: UserProfile = JSON.parse(raw);
    if (!profile.avatarUrl) {
      const avatar = getUserAvatarUrl(profile);
      if (avatar) profile.avatarUrl = avatar;
    }
    return profile;
  } catch (err) {
    return null;
  }
}

export function saveSession(user: UserProfile) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Error saving session:', err);
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error('Error clearing session:', err);
  }
}

const LS_CUSTOM_PASSWORDS_KEY = 'mg_experience_custom_passwords_cache';
const CONFIG_RECORD_ID = '00000000-0000-0000-0000-000000000001';

export async function fetchCustomPasswords(): Promise<Record<string, string>> {
  const { supabase } = await import('./supabase');
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('resumen')
        .eq('id', CONFIG_RECORD_ID)
        .maybeSingle();

      if (!error && data && data.resumen) {
        try {
          const parsed = JSON.parse(data.resumen);
          const map = parsed.user_passwords || {};
          localStorage.setItem(LS_CUSTOM_PASSWORDS_KEY, JSON.stringify(map));
          return map;
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Failed to fetch custom passwords in AuditApp:', err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_CUSTOM_PASSWORDS_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
}

export function getCachedCustomPasswords(): Record<string, string> {
  try {
    const cached = localStorage.getItem(LS_CUSTOM_PASSWORDS_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
}

export async function updateUserPassword(
  email: string,
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = normalizeEmail(email);
  const cleanCurrent = (currentPass || '').trim();
  const cleanNew = (newPass || '').trim();

  if (!cleanNew || cleanNew.length < 6) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
  }

  const account = AUTHORIZED_USERS.find(
    (u) => normalizeEmail(u.email) === cleanEmail
  );
  if (!account) {
    return { success: false, error: 'Usuario no encontrado.' };
  }

  const currentMap = await fetchCustomPasswords();
  const expectedPassword = currentMap[cleanEmail] || account.password;

  const isCurrentMatch =
    cleanCurrent === expectedPassword ||
    (expectedPassword.endsWith('.') && cleanCurrent === expectedPassword.slice(0, -1)) ||
    (!expectedPassword.endsWith('.') && cleanCurrent === `${expectedPassword}.`);

  if (!isCurrentMatch) {
    return { success: false, error: 'La contraseña actual ingresada es incorrecta.' };
  }

  const updatedMap = {
    ...currentMap,
    [cleanEmail]: cleanNew,
  };
  localStorage.setItem(LS_CUSTOM_PASSWORDS_KEY, JSON.stringify(updatedMap));

  const { supabase } = await import('./supabase');
  if (supabase) {
    try {
      await supabase.from('audits').upsert({
        id: CONFIG_RECORD_ID,
        tienda: '__CONFIG_STORE__',
        auditor: 'SYSTEM',
        fecha: '2026-01-01',
        resumen: JSON.stringify({ user_passwords: updatedMap }),
        savedBy: 'SYSTEM',
        savedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to sync password to Supabase in AuditApp:', err);
    }
  }

  return { success: true };
}

export async function authenticateAsync(
  emailInput: string,
  passwordInput: string
): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  const emailClean = normalizeEmail(emailInput);
  const passClean = (passwordInput || '').trim();

  const user = AUTHORIZED_USERS.find(
    (u) => normalizeEmail(u.email) === emailClean
  );

  if (!user) {
    return {
      success: false,
      error: 'Credenciales inválidas. Verificá tu correo y contraseña.',
    };
  }

  let customMap: Record<string, string> = {};
  try {
    customMap = await fetchCustomPasswords();
  } catch (e) {
    customMap = getCachedCustomPasswords();
  }

  const effectivePassword = customMap[emailClean] || user.password;

  const isPasswordMatch =
    passClean === effectivePassword ||
    (effectivePassword.endsWith('.') && passClean === effectivePassword.slice(0, -1)) ||
    (!effectivePassword.endsWith('.') && passClean === `${effectivePassword}.`);

  if (isPasswordMatch) {
    const profile: UserProfile = {
      email: user.email,
      name: user.name,
      role: user.role,
      roleLabel: user.roleLabel,
      avatarUrl: user.avatarUrl,
    };
    saveSession(profile);
    return { success: true, user: profile };
  }

  return {
    success: false,
    error: 'Credenciales inválidas. Verificá tu correo y contraseña.',
  };
}

export function authenticate(
  emailInput: string,
  passwordInput: string
): {
  success: boolean;
  user?: UserProfile;
  error?: string;
} {
  const emailClean = normalizeEmail(emailInput);
  const passClean = (passwordInput || '').trim();

  const user = AUTHORIZED_USERS.find(
    (u) => normalizeEmail(u.email) === emailClean
  );

  if (user) {
    const customMap = getCachedCustomPasswords();
    const effectivePassword = customMap[emailClean] || user.password;

    if (passClean === effectivePassword) {
      const profile: UserProfile = {
        email: user.email,
        name: user.name,
        role: user.role,
        roleLabel: user.roleLabel,
        avatarUrl: user.avatarUrl,
      };
      saveSession(profile);
      return { success: true, user: profile };
    }
  }

  return {
    success: false,
    error: 'Credenciales inválidas. Verificá tu correo y contraseña.',
  };
}
