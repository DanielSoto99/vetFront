"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function NuevaVacunaPage() {
  const router = useRouter();
  const params = useParams();
  const mascotaId = params.id as string;

  const [form, setForm] = useState({
    nombre: "",
    laboratorio: "",
    lote: "",
    fechaAplicacion: "",
    fechaProximaDosis: "",
    observaciones: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.nombre || !form.fechaAplicacion) {
      setError("Debes ingresar vacuna y fecha de aplicación.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiFetch("/vacunas", {
        method: "POST",
        body: JSON.stringify({
          mascotaId: Number(mascotaId),
          nombre: form.nombre,
          laboratorio: form.laboratorio,
          lote: form.lote,
          fechaAplicacion: new Date(form.fechaAplicacion).toISOString(),
          fechaProximaDosis: form.fechaProximaDosis
            ? new Date(form.fechaProximaDosis).toISOString()
            : undefined,
          observaciones: form.observaciones,
        }),
      });

      router.push(`/dashboard/pacientes/${mascotaId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar vacuna");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href={`/dashboard/pacientes/${mascotaId}`}
          className="text-sm text-slate-500"
        >
          ← Volver a ficha
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Registrar vacuna
          </h1>
          <p className="text-slate-500">
            Guarda aplicación, lote y próxima dosis.
          </p>
        </div>

        <form onSubmit={guardar} className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
          <Campo label="Nombre vacuna *">
            <input
              className="input"
              placeholder="Ej: Polivalente, Antirrábica"
              value={form.nombre}
              onChange={(e) => update("nombre", e.target.value)}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Laboratorio">
              <input
                className="input"
                value={form.laboratorio}
                onChange={(e) => update("laboratorio", e.target.value)}
              />
            </Campo>

            <Campo label="Lote">
              <input
                className="input"
                value={form.lote}
                onChange={(e) => update("lote", e.target.value)}
              />
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Fecha aplicación *">
              <input
                type="date"
                className="input"
                value={form.fechaAplicacion}
                onChange={(e) => update("fechaAplicacion", e.target.value)}
              />
            </Campo>

            <Campo label="Próxima dosis">
              <input
                type="date"
                className="input"
                value={form.fechaProximaDosis}
                onChange={(e) => update("fechaProximaDosis", e.target.value)}
              />
            </Campo>
          </div>

          <Campo label="Observaciones">
            <textarea
              rows={4}
              className="input"
              value={form.observaciones}
              onChange={(e) => update("observaciones", e.target.value)}
            />
          </Campo>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href={`/dashboard/pacientes/${mascotaId}`}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-slate-700"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar vacuna"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}