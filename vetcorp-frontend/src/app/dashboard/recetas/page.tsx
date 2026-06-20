"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type MedicamentoForm = {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  via: string;
  indicaciones: string;
};

type Mascota = {
  id: number;
  nombre: string;
  raza?: string | null;
  sexo?: string | null;
  pesoActual?: number | null;
  especie?: {
    id?: number;
    nombre: string;
  } | string;
  tutor?: {
    id: number;
    nombre: string;
    apellido?: string | null;
    telefono?: string | null;
  };
};

type Consulta = {
  id: number;
  mascotaId: number;
  tipoConsulta: string;
  motivoConsulta?: string | null;
  diagnosticoPresuntivo?: string | null;
  diagnosticoDefinitivo?: string | null;
  fechaConsulta: string;
  mascota?: Mascota;
  receta?: {
    id: number;
  } | null;
};

type Receta = {
  id: number;
  numero?: string | null;
  indicaciones?: string | null;
  observaciones?: string | null;
  emitida: boolean;
  fechaEmision?: string | null;
  fechaCreacion: string;
  consultaId: number;
  consulta?: {
    id: number;
    tipoConsulta: string;
    motivoConsulta?: string | null;
    diagnosticoPresuntivo?: string | null;
    diagnosticoDefinitivo?: string | null;
    fechaConsulta: string;
    mascota?: Mascota;
    veterinario?: {
      nombre: string;
      apellido?: string | null;
      sexoUsuario?: "M" | "F" | "OTRO";
    };
    tratamientoMedicamentos?: {
      id: number;
      nombre: string;
      dosis?: string | null;
      frecuencia?: string | null;
      duracion?: string | null;
      via?: string | null;
      indicaciones?: string | null;
    }[];
  };
};

function formatearFecha(fecha?: string | null) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function obtenerNombreEspecie(mascota?: Mascota) {
  if (!mascota?.especie) return "Sin especie";

  if (typeof mascota.especie === "string") {
    return mascota.especie;
  }

  return mascota.especie.nombre;
}

function tituloVeterinario(veterinario?: {
  nombre: string;
  apellido?: string | null;
  sexoUsuario?: "M" | "F" | "OTRO";
}) {
  if (!veterinario) return "Sin profesional";

  const titulo =
    veterinario.sexoUsuario === "F"
      ? "Dra."
      : veterinario.sexoUsuario === "M"
      ? "Dr."
      : "";

  return `${titulo} ${veterinario.nombre} ${veterinario.apellido || ""}`.trim();
}

export default function RecetasPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);

  const [mascotaId, setMascotaId] = useState("");
  const [consultaId, setConsultaId] = useState("");
  const [indicaciones, setIndicaciones] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [medicamento, setMedicamento] = useState<MedicamentoForm>({
  nombre: "",
  dosis: "",
  frecuencia: "",
  duracion: "",
  via: "",
  indicaciones: "",
});

const [medicamentos, setMedicamentos] = useState<MedicamentoForm[]>([]);

  async function cargarDatos() {
    try {
      setLoading(true);
      setError("");

      const [mascotasResp, consultasResp, recetasResp] = await Promise.all([
        apiFetch("/mascotas"),
        apiFetch("/consultas"),
        apiFetch("/recetas"),
      ]);

      setMascotas(Array.isArray(mascotasResp) ? mascotasResp : []);
      setConsultas(Array.isArray(consultasResp) ? consultasResp : []);
      setRecetas(Array.isArray(recetasResp) ? recetasResp : []);
    } catch (err: any) {
      setError(err.message || "Error al cargar recetas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const consultasDisponibles = useMemo(() => {
    if (!mascotaId) return [];

    return consultas.filter((consulta) => {
      const mismaMascota = Number(consulta.mascotaId) === Number(mascotaId);
      const yaTieneReceta =
        Boolean(consulta.receta) ||
        recetas.some((receta) => Number(receta.consultaId) === Number(consulta.id));

      return mismaMascota && !yaTieneReceta;
    });
  }, [consultas, recetas, mascotaId]);

  const recetasFiltradas = recetas.filter((receta) => {
    const mascota = receta.consulta?.mascota;
    const tutor = mascota?.tutor;
    const veterinario = receta.consulta?.veterinario;

    const texto = `
      ${receta.numero || ""}
      ${receta.indicaciones || ""}
      ${receta.observaciones || ""}
      ${receta.consulta?.tipoConsulta || ""}
      ${receta.consulta?.motivoConsulta || ""}
      ${receta.consulta?.diagnosticoPresuntivo || ""}
      ${receta.consulta?.diagnosticoDefinitivo || ""}
      ${mascota?.nombre || ""}
      ${mascota?.raza || ""}
      ${obtenerNombreEspecie(mascota)}
      ${tutor?.nombre || ""}
      ${tutor?.apellido || ""}
      ${veterinario?.nombre || ""}
      ${veterinario?.apellido || ""}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  function agregarMedicamento() {
    if (!medicamento.nombre.trim()) {
        setError("Debes ingresar el nombre del medicamento.");
        return;
    }

    setMedicamentos((prev) => [...prev, medicamento]);

    setMedicamento({
        nombre: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
        via: "",
        indicaciones: "",
    });

    setError("");
    }

    function eliminarMedicamento(index: number) {
        setMedicamentos((prev) => prev.filter((_, i) => i !== index));
    }

  async function guardarReceta(emitirAhora: boolean) {
    if (!consultaId) {
      setError("Debes seleccionar una consulta asociada.");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const resp = await apiFetch("/recetas", {
        method: "POST",
        body: JSON.stringify({
        consultaId: Number(consultaId),
        indicaciones,
        observaciones,
        medicamentos,
        }),
      });

      const recetaCreada = resp.receta;

      if (emitirAhora && recetaCreada?.id) {
        await apiFetch(`/recetas/${recetaCreada.id}/emitir`, {
          method: "PUT",
        });
      }

      setMensaje(
        emitirAhora
          ? "Receta emitida correctamente."
          : "Receta guardada como borrador.",
      );

      setMascotaId("");
      setConsultaId("");
      setIndicaciones("");
      setObservaciones("");
      setMedicamentos([]);
      setMedicamento({
        nombre: "",
        dosis: "",
        frecuencia: "",
        duracion: "",
        via: "",
        indicaciones: "",
     });
      

      await cargarDatos();
    } catch (err: any) {
      setError(err.message || "Error al guardar receta");
    } finally {
      setGuardando(false);
    }
  }

  const total = recetas.length;
  const emitidas = recetas.filter((r) => r.emitida).length;
  const borradores = recetas.filter((r) => !r.emitida).length;

  return (
  <main className="p-4 sm:p-6">
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Recetas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona recetas asociadas a consultas clínicas.
          </p>
        </div>

        <Link
          href="/dashboard/consultas"
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Ver consultas
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total recetas</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{total}</p>
          <p className="mt-1 text-xs text-slate-400">
            Registradas en el sistema
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Emitidas</p>
          <p className="mt-2 text-4xl font-bold text-green-600">
            {emitidas}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Listas para imprimir
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Borradores</p>
          <p className="mt-2 text-4xl font-bold text-yellow-500">
            {borradores}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Pendientes de emisión
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Nueva receta</h2>
            <p className="text-sm text-slate-500">
              Selecciona un paciente y una consulta clínica para generar la receta.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            Requiere consulta asociada
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Paciente
            </label>

            <select
              value={mascotaId}
              onChange={(e) => {
                setMascotaId(e.target.value);
                setConsultaId("");
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="">Seleccionar paciente existente</option>

              {mascotas.map((mascota) => (
                <option key={mascota.id} value={mascota.id}>
                  {mascota.nombre} — {obtenerNombreEspecie(mascota)}
                  {mascota.tutor
                    ? ` — Tutor: ${mascota.tutor.nombre} ${mascota.tutor.apellido || ""}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Consulta asociada
            </label>

            <select
              value={consultaId}
              onChange={(e) => setConsultaId(e.target.value)}
              disabled={!mascotaId}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {mascotaId
                  ? "Seleccionar consulta sin receta"
                  : "Primero selecciona un paciente"}
              </option>

              {consultasDisponibles.map((consulta) => (
                <option key={consulta.id} value={consulta.id}>
                  {formatearFecha(consulta.fechaConsulta)} — {consulta.tipoConsulta}
                  {consulta.motivoConsulta ? ` — ${consulta.motivoConsulta}` : ""}
                </option>
              ))}
            </select>

            {mascotaId && consultasDisponibles.length === 0 && (
              <p className="mt-2 text-xs text-yellow-600">
                Este paciente no tiene consultas disponibles sin receta.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Medicamentos</h3>
              <p className="text-sm text-slate-500">
                Agrega los medicamentos que aparecerán en la receta.
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
              {medicamentos.length} medicamento(s)
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <input
              value={medicamento.nombre}
              onChange={(e) =>
                setMedicamento({
                  ...medicamento,
                  nombre: e.target.value,
                })
              }
              placeholder="Medicamento"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />

            <input
              value={medicamento.dosis}
              onChange={(e) =>
                setMedicamento({
                  ...medicamento,
                  dosis: e.target.value,
                })
              }
              placeholder="Dosis"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />

            <input
              value={medicamento.frecuencia}
              onChange={(e) =>
                setMedicamento({
                  ...medicamento,
                  frecuencia: e.target.value,
                })
              }
              placeholder="Frecuencia"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />

            <input
              value={medicamento.duracion}
              onChange={(e) =>
                setMedicamento({
                  ...medicamento,
                  duracion: e.target.value,
                })
              }
              placeholder="Duración"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />

            <input
              value={medicamento.via}
              onChange={(e) =>
                setMedicamento({
                  ...medicamento,
                  via: e.target.value,
                })
              }
              placeholder="Vía de administración"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />

            <input
              value={medicamento.indicaciones}
              onChange={(e) =>
                setMedicamento({
                  ...medicamento,
                  indicaciones: e.target.value,
                })
              }
              placeholder="Indicaciones específicas"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={agregarMedicamento}
            className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Agregar medicamento
          </button>

          {medicamentos.length > 0 && (
            <div className="mt-5 space-y-3">
              {medicamentos.map((med, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {med.nombre}
                    </p>

                    <p className="text-sm text-slate-500">
                      {med.dosis || "Sin dosis"} ·{" "}
                      {med.frecuencia || "Sin frecuencia"} ·{" "}
                      {med.duracion || "Sin duración"}
                    </p>

                    {med.via && (
                      <p className="text-xs text-slate-400">
                        Vía: {med.via}
                      </p>
                    )}

                    {med.indicaciones && (
                      <p className="mt-1 text-xs text-slate-400">
                        {med.indicaciones}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => eliminarMedicamento(index)}
                    className="rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Indicaciones para el tutor
            </label>

            <textarea
              value={indicaciones}
              onChange={(e) => setIndicaciones(e.target.value)}
              rows={4}
              placeholder="Ej: Administrar después de comida, mantener reposo, controlar evolución..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Observaciones internas
            </label>

            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={4}
              placeholder="Observaciones adicionales para registro interno..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            disabled={guardando || !consultaId}
            onClick={() => guardarReceta(false)}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Guardar borrador
          </button>

          <button
            type="button"
            disabled={guardando || !consultaId}
            onClick={() => guardarReceta(true)}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {guardando ? "Guardando..." : "Emitir receta"}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-4 shadow-sm">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por paciente, tutor, consulta o profesional..."
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
        />
      </section>

      {loading ? (
        <section className="rounded-3xl border bg-white p-8 text-sm text-slate-500 shadow-sm">
          Cargando recetas...
        </section>
      ) : recetasFiltradas.length === 0 ? (
        <section className="rounded-3xl border bg-white p-12 text-center shadow-sm">
          <div className="text-4xl">💊</div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No hay recetas registradas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Las recetas aparecerán aquí cuando sean generadas desde una consulta clínica.
          </p>

          <Link
            href="/dashboard/consultas"
            className="mt-5 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Ir al historial clínico
          </Link>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="font-bold text-slate-900">Listado de recetas</h2>
            <p className="text-sm text-slate-400">
              {recetasFiltradas.length} receta(s)
            </p>
          </div>

          <div className="divide-y">
            {recetasFiltradas.map((receta) => {
              const mascota = receta.consulta?.mascota;
              const tutor = mascota?.tutor;
              const diagnostico =
                receta.consulta?.diagnosticoDefinitivo ||
                receta.consulta?.diagnosticoPresuntivo ||
                receta.consulta?.motivoConsulta ||
                "Sin diagnóstico registrado";

              return (
                <div
                  key={receta.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-4 hover:bg-slate-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    💊
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {mascota?.nombre || "Paciente sin nombre"}
                      </p>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          receta.emitida
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {receta.emitida ? "Emitida" : "Borrador"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Tutor: {tutor?.nombre || "Sin tutor"}{" "}
                      {tutor?.apellido || ""} · {obtenerNombreEspecie(mascota)}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      {diagnostico}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">
                      {formatearFecha(receta.fechaEmision || receta.fechaCreacion)}
                    </p>

                    <p className="text-xs text-slate-400">
                      {tituloVeterinario(receta.consulta?.veterinario)}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/recetas/${receta.id}`}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Ver receta
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  </main>
);
}