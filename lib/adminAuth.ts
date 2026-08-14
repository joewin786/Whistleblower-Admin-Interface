// lib/adminAuth.ts
export interface AdminData {
  id: number;
  full_name: string;
  email: string;
  department: string;
  role: "superadmin" | "admin" | "investigator";
}

export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
};

export const getAdminData = (): AdminData | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("admin_data");
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getAdminToken();
};

export const isSuperAdmin = (): boolean => {
  const admin = getAdminData();
  return admin?.role === "superadmin";
};

export const isAdmin = (): boolean => {
  const admin = getAdminData();
  return admin?.role === "admin" || admin?.role === "superadmin";
};

export const logout = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_data");
  window.location.href = "/login";
};

// Helper untuk fetch dengan auth
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAdminToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
