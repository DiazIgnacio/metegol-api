"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";

interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  sizeKB: number;
  sizeMB: number;
}

function CacheContent() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cache?action=stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearExpiredCache = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cache?action=clear-expired");
      const data = await response.json();
      if (data.success) {
        setMessage("Expired cache cleared successfully");
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      setMessage("Error clearing cache");
    } finally {
      setLoading(false);
    }
  };

  const triggerCacheRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/cron/refresh-cache", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Cache refresh triggered successfully");
        fetchStats(); // Refresh stats
      } else {
        setMessage("Error triggering cache refresh");
      }
    } catch (error) {
      console.error("Error triggering refresh:", error);
      setMessage("Error triggering cache refresh");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 lg:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
            💾 Administración de Cache
          </h1>
          <p className="text-gray-600">
            Monitorea y gestiona el cache de Firebase para datos de Football API
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {message}
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Cache Statistics */}
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">
                Estadísticas del Cache
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !stats ? (
                <div className="py-4 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Entries:</span>
                    <span className="font-semibold text-gray-900">
                      {stats.totalEntries}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expired Entries:</span>
                    <span className="font-semibold text-red-600">
                      {stats.expiredEntries}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cache Size:</span>
                    <span className="font-semibold text-gray-900">
                      {stats.sizeMB > 0
                        ? `${stats.sizeMB} MB`
                        : `${stats.sizeKB} KB`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health:</span>
                    <span
                      className={`font-semibold ${
                        stats.expiredEntries === 0
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {stats.expiredEntries === 0
                        ? "Saludable"
                        : "Necesita Limpieza"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Error al cargar estadísticas
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">
                Acciones del Cache
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:bg-blue-600/50 lg:py-3 lg:text-base"
              >
                {loading ? "Actualizando..." : "Actualizar Estadísticas"}
              </button>

              <button
                onClick={clearExpiredCache}
                disabled={loading}
                className="w-full rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white transition-colors hover:bg-yellow-700 disabled:bg-yellow-600/50 lg:py-3 lg:text-base"
              >
                {loading ? "Limpiando..." : "Limpiar Cache Expirado"}
              </button>

              <button
                onClick={triggerCacheRefresh}
                disabled={refreshing}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700 disabled:bg-green-600/50 lg:py-3 lg:text-base"
              >
                {refreshing ? "Refrescando Cache..." : "Actualizar Cache"}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Cache Info */}
        <Card className="mt-6 border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Información del Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600">
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">
                  Configuración TTL:
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>• Partidos en vivo: 5 minutos</li>
                  <li>• Partidos próximos: 15 minutos</li>
                  <li>• Partidos finalizados: 3 horas</li>
                  <li>• Datos de equipos: 24 horas</li>
                  <li>• Ligas: 48 horas</li>
                  <li>• Posiciones: 1 hora</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">
                  Actualización Automática:
                </h4>
                <p className="text-sm">
                  El cache se actualiza automáticamente cada 15 minutos para
                  ligas prioritarias y partidos en vivo a través del endpoint
                  cron:{" "}
                  <code className="rounded bg-gray-100 px-2 py-1 text-gray-800">
                    /api/cron/refresh-cache
                  </code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CacheAdminPage() {
  return (
    <AdminLayout>
      <CacheContent />
    </AdminLayout>
  );
}
