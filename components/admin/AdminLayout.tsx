"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./LoginForm";

interface User {
  email: string;
  isAdmin: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/login");
      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <p className="text-lg text-white">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-900 transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-center bg-gray-800">
          <h1 className="text-xl font-bold text-white">⚽ Admin Panel</h1>
        </div>

        <nav className="mt-8">
          <div className="space-y-2 px-4">
            <button
              onClick={() => router.push("/admin")}
              className="w-full rounded-lg px-4 py-2 text-left text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              🔄 Sincronización
            </button>
            <button
              onClick={() => router.push("/admin/cache")}
              className="w-full rounded-lg px-4 py-2 text-left text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              💾 Cache
            </button>
          </div>
        </nav>

        {/* User info */}
        <div className="absolute right-0 bottom-0 left-0 bg-gray-800 p-4">
          <div className="mb-4 flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
              <span className="text-sm font-bold text-white">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.email}</p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <div className="hidden items-center text-sm text-gray-500 md:flex">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  🟢 Conectado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
