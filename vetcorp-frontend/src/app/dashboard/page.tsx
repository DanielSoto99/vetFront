"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type DashboardData = {
  kpis: {
    totalTutores: number;
    totalMascotas: number;
    consultasMes: number;
    citasHoy: number;
    vacunasProximas: number;
    vacunasVencidas: number;
    desparasitacionesProximas: number;
    desparasitacionesVencidas: number;
  };
  citasHoy: any[];
  alertasClinicas: {
    vacunasProximas: any[];
    vacunasVencidas: any[];
    desparasitacionesProximas: any[];
    desparasitacionesVencidas: any[];
  };
  ultimasConsultas: any[];
  pacientesRecientes: any[];
};

function formatearFecha(fecha?: string) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatearHora(fecha?: string) {
  if (!fecha) return "--:--";

  return new Date(fecha).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function saludar() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function emojiEspecie(especie?: string) {
  const mapa: Record<string, string> = {
    Canino: "🐶",
    Felino: "🐱",
    Ave: "🐦",
    Conejo: "🐰",
    Reptil: "🦎",
    Roedor: "🐹",
    Otro: "🐾",
  };

  return mapa[especie || ""] || "🐾";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const usuarioStorage = localStorage.getItem("usuario");

    if (usuarioStorage) {
      setUsuario(JSON.parse(usuarioStorage));
    }

    async function cargarDashboard() {
      try {
        const resp = await apiFetch("/dashboard/resumen");
        setData(resp);
      } catch (err: any) {
        setError(err.message || "Error al cargar dashboard");
      } finally {
        setLoading(false);
      }
    }

    cargarDashboard();
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-slate-500">Cargando dashboard...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="p-6">
        <div className="rounded-2xl bg-red-50 p-4 text-red-600">
          {error || "No se pudo cargar el dashboard"}
        </div>
      </main>
    );
  }

  const totalAlertas =
    data.kpis.vacunasVencidas +
    data.kpis.vacunasProximas +
    data.kpis.desparasitacionesVencidas +
    data.kpis.desparasitacionesProximas;

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {saludar()}, {usuario?.nombre || "Veterinario"} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Resumen clínico y operacional de VetCorp
            </p>
          </div>

          <Link
            href="/dashboard/consultas/nueva"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Nueva consulta
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Citas hoy</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {data.kpis.citasHoy}
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pacientes</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {data.kpis.totalMascotas}
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Consultas mes</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {data.kpis.consultasMes}
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Alertas</p>
            <p className="mt-2 text-4xl font-bold text-red-500">
              {totalAlertas}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h2 className="font-bold text-slate-900">Agenda de hoy</h2>
              <Link
                href="/dashboard/agenda"
                className="text-sm text-slate-400 hover:text-slate-700"
              >
                Ver completa →
              </Link>
            </div>

            <div className="divide-y">
              {data.citasHoy.length === 0 ? (
                <div className="p-6 text-sm text-slate-400">
                  No tienes citas programadas para hoy.
                </div>
              ) : (
                data.citasHoy.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50"
                  >
                    <div className="w-16 text-center">
                      <p className="text-sm font-bold text-slate-900">
                        {formatearHora(cita.fechaInicio)}
                      </p>
                      <span className="text-xl">
                        {emojiEspecie(cita.mascota?.especie)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {cita.mascota?.nombre || cita.titulo}
                      </p>
                      <p className="text-sm text-slate-500">
                        {cita.tipo} · {cita.tutor?.nombre}{" "}
                        {cita.tutor?.apellido || ""}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {cita.estado}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Acciones rápidas</h2>

            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  href: "/dashboard/consultas/nueva",
                  label: "Nueva consulta",
                  emoji: "📋",
                  dark: true,
                },
                {
                  href: "/dashboard/agenda",
                  label: "Agenda",
                  emoji: "📅",
                  dark: false,
                },
                {
                  href: "/dashboard/pacientes/nueva",
                  label: "Nuevo paciente",
                  emoji: "🐾",
                  dark: false,
                },
                {
                  href: "/dashboard/recetas",
                  label: "Recetas",
                  emoji: "💊",
                  dark: false,
                },
                {
                  href: "/dashboard/consultas",
                  label: "Historial",
                  emoji: "🗂️",
                  dark: false,
                },
                {
                  href: "/dashboard/pacientes",
                  label: "Pacientes",
                  emoji: "📁",
                  dark: false,
                },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl p-3 text-center text-xs font-medium transition-all hover:scale-[1.02] ${
                    a.dark
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xl">{a.emoji}</span>
                  {a.label}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h2 className="font-bold text-slate-900">Alertas clínicas</h2>
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                {totalAlertas} activas
              </span>
            </div>

            <div className="divide-y">
              {totalAlertas === 0 ? (
                <div className="p-6 text-sm text-slate-400">
                  No hay alertas clínicas activas.
                </div>
              ) : (
                <>
                  {data.alertasClinicas.vacunasVencidas.map((v) => (
                    <AlertaItem
                      key={`vacuna-v-${v.id}`}
                      tipo="error"
                      texto={`${v.mascota.nombre} — vacuna ${v.nombre} vencida.`}
                      mascotaId={v.mascotaId}
                    />
                  ))}

                  {data.alertasClinicas.vacunasProximas.map((v) => (
                    <AlertaItem
                      key={`vacuna-p-${v.id}`}
                      tipo="warning"
                      texto={`${v.mascota.nombre} — vacuna ${v.nombre} próxima a vencer.`}
                      mascotaId={v.mascotaId}
                    />
                  ))}

                  {data.alertasClinicas.desparasitacionesVencidas.map((d) => (
                    <AlertaItem
                      key={`desp-v-${d.id}`}
                      tipo="error"
                      texto={`${d.mascota.nombre} — desparasitación vencida.`}
                      mascotaId={d.mascotaId}
                    />
                  ))}

                  {data.alertasClinicas.desparasitacionesProximas.map((d) => (
                    <AlertaItem
                      key={`desp-p-${d.id}`}
                      tipo="warning"
                      texto={`${d.mascota.nombre} — próxima desparasitación pendiente.`}
                      mascotaId={d.mascotaId}
                    />
                  ))}
                </>
              )}
            </div>
          </section>

          <section className="rounded-3xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h2 className="font-bold text-slate-900">Pacientes recientes</h2>
              <Link
                href="/dashboard/pacientes"
                className="text-sm text-slate-400 hover:text-slate-700"
              >
                Ver todos →
              </Link>
            </div>

            <div className="divide-y">
              {data.pacientesRecientes.length === 0 ? (
                <div className="p-6 text-sm text-slate-400">
                  No hay pacientes registrados.
                </div>
              ) : (
                data.pacientesRecientes.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50"
                  >
                    <span className="text-2xl">{emojiEspecie(p.especie)}</span>

                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {p.nombre}
                        <span className="ml-2 text-sm font-normal text-slate-400">
                          {p.raza || "Sin raza"}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Tutor: {p.tutor?.nombre} {p.tutor?.apellido || ""}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/pacientes/${p.id}`}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Ficha
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <h2 className="font-bold text-slate-900">Últimas consultas</h2>
            <Link
              href="/dashboard/consultas"
              className="text-sm text-slate-400 hover:text-slate-700"
            >
              Ver historial →
            </Link>
          </div>

          <div className="divide-y">
            {data.ultimasConsultas.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">
                No hay consultas registradas.
              </div>
            ) : (
              data.ultimasConsultas.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50"
                >
                  <span className="text-2xl">
                    {emojiEspecie(c.mascota?.especie)}
                  </span>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {c.mascota?.nombre} · {c.tipoConsulta}
                    </p>
                    <p className="text-sm text-slate-500">
                      {c.diagnosticoPresuntivo || "Sin diagnóstico"} ·{" "}
                      {formatearFecha(c.fechaConsulta)}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {c.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AlertaItem({
  tipo,
  texto,
  mascotaId,
}: {
  tipo: "error" | "warning";
  texto: string;
  mascotaId: number;
}) {
  const styles =
    tipo === "error"
      ? "bg-red-50 text-red-700"
      : "bg-yellow-50 text-yellow-800";

  const icono = tipo === "error" ? "🚨" : "⚠️";

  return (
    <div className={`flex items-start gap-3 px-5 py-4 ${styles}`}>
      <span>{icono}</span>
      <p className="flex-1 text-sm">{texto}</p>
      <Link
        href={`/dashboard/pacientes/${mascotaId}`}
        className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Ver
      </Link>
    </div>
  );
}