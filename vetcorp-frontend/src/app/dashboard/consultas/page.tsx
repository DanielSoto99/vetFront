"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Consulta = {
  id: number;
  tipoConsulta: string;
  estado: string;
  fechaConsulta: string;
  motivoConsulta: string;
  diagnosticoPresuntivo?: string;
  diagnosticoDefinitivo?: string;
  mascota?: {
    id: number;
    nombre: string;
    especie?: {
      nombre: string;
    };
    raza?: string;
    tutor?: {
      nombre: string;
      apellido?: string;
    };
  };
};

function fecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function emojiEspecie(especie?: string) {
  const mapa: Record<string, string> = {
    Canino: "🐶",
    Felino: "🐱",
    Ave: "🐦",
    Reptil: "🦎",
    Exótico: "🦜",
    Otro: "🐾",
  };

  return mapa[especie || ""] || "🐾";
}

export default function ConsultasPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await apiFetch("/consultas");
        setConsultas(data);
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, []);

  const filtradas = consultas.filter((c) => {
    const q = busqueda.toLowerCase();

    return (
      c.tipoConsulta.toLowerCase().includes(q) ||
      c.estado.toLowerCase().includes(q) ||
      c.motivoConsulta.toLowerCase().includes(q) ||
      (c.diagnosticoPresuntivo || "").toLowerCase().includes(q) ||
      (c.mascota?.nombre || "").toLowerCase().includes(q) ||
      (c.mascota?.tutor?.nombre || "").toLowerCase().includes(q) ||
      (c.mascota?.tutor?.apellido || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Historial clínico
            </h1>
            <p className="text-slate-500">
              Consultas registradas por el veterinario
            </p>
          </div>

          <Link
            href="/dashboard/consultas/nueva"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Nueva consulta
          </Link>
        </div>

        <section className="rounded-3xl border bg-white p-4 shadow-sm">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por paciente, tutor, diagnóstico, motivo..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
          />
        </section>

        <section className="rounded-3xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-slate-400">Cargando consultas...</div>
          ) : filtradas.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="mb-3 text-4xl">🗂️</p>
              <p className="font-medium">No hay consultas registradas</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtradas.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    {emojiEspecie(c.mascota?.especie?.nombre)}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {c.mascota?.nombre || "Sin paciente"} · {c.tipoConsulta}
                    </p>

                    <p className="text-sm text-slate-500">
                      {fecha(c.fechaConsulta)} ·{" "}
                      {c.diagnosticoPresuntivo || "Sin diagnóstico"}
                    </p>

                    <p className="text-xs text-slate-400">
                      Tutor: {c.mascota?.tutor?.nombre}{" "}
                      {c.mascota?.tutor?.apellido || ""} · Motivo:{" "}
                      {c.motivoConsulta}
                    </p>
                  </div>

                  <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:block">
                    {c.estado}
                  </span>

                  {c.mascota?.id && (
                    <Link
                      href={`/dashboard/pacientes/${c.mascota.id}`}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Ver ficha
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-right text-sm text-slate-400">
          {filtradas.length} consultas
        </p>
      </div>
    </main>
  );
}