"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Mascota = {
  id: number;
  nombre: string;
  especie?: { nombre: string };
  raza?: string;
  pesoActual?: number;
  tutor?: {
    nombre: string;
    apellido?: string;
    telefono?: string;
  };
};

type Medicamento = {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  via: string;
  indicaciones: string;
};

type FormConsulta = {
  mascotaId: string;
  tipoConsulta: string;
  estado: string;
  pesoActual: string;
  temperatura: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  trc: string;
  mucosas: string;
  motivoConsulta: string;
  duracionSintomas: string;
  anamnesis: string;
  estadoGeneral: string;
  sistemaCardiovascular: string;
  sistemaRespiratorio: string;
  sistemaDigestivo: string;
  sistemaNeurologico: string;
  sistemaMusculoEsqueletico: string;
  pielPelaje: string;
  diagnosticoPresuntivo: string;
  diagnosticoDefinitivo: string;
  indicacionesTutor: string;
  fechaControl: string;
  observacionesCierre: string;
  examenes: string[];
  medicamentos: Medicamento[];
  generarReceta: boolean;
};

const FORM_INICIAL: FormConsulta = {
  mascotaId: "",
  tipoConsulta: "Consulta general",
  estado: "COMPLETADA",
  pesoActual: "",
  temperatura: "",
  frecuenciaCardiaca: "",
  frecuenciaRespiratoria: "",
  trc: "",
  mucosas: "",
  motivoConsulta: "",
  duracionSintomas: "",
  anamnesis: "",
  estadoGeneral: "",
  sistemaCardiovascular: "",
  sistemaRespiratorio: "",
  sistemaDigestivo: "",
  sistemaNeurologico: "",
  sistemaMusculoEsqueletico: "",
  pielPelaje: "",
  diagnosticoPresuntivo: "",
  diagnosticoDefinitivo: "",
  indicacionesTutor: "",
  fechaControl: "",
  observacionesCierre: "",
  examenes: [],
  medicamentos: [],
  generarReceta: false,
};

const STEPS = [
  "Paciente",
  "Signos",
  "Anamnesis",
  "Examen",
  "Diagnóstico",
  "Resumen",
];

const TIPOS_CONSULTA = [
  "Consulta general",
  "Control",
  "Vacunación",
  "Desparasitación",
  "Urgencia",
  "Domicilio",
  "Otro",
];

const EXAMENES_COMUNES = [
  "Hemograma completo",
  "Bioquímica sérica",
  "Urianálisis",
  "Radiografía",
  "Ecografía",
  "Citología",
  "Raspado cutáneo",
  "Test FIV/FeLV",
];

export default function NuevaConsultaPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState<FormConsulta>(FORM_INICIAL);
  const [nuevoMed, setNuevoMed] = useState<Medicamento>({
    nombre: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    via: "Oral",
    indicaciones: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarMascotas() {
      const data = await apiFetch("/mascotas");
      setMascotas(data);
    }

    cargarMascotas();
  }, []);

  const mascotaSeleccionada =
    mascotas.find((m) => m.id === Number(form.mascotaId)) || null;

  const mascotasFiltradas = mascotas.filter((m) => {
    const q = busqueda.toLowerCase();
    return (
      m.nombre.toLowerCase().includes(q) ||
      (m.raza || "").toLowerCase().includes(q) ||
      (m.especie?.nombre || "").toLowerCase().includes(q) ||
      (m.tutor?.nombre || "").toLowerCase().includes(q) ||
      (m.tutor?.apellido || "").toLowerCase().includes(q)
    );
  });

  function update<K extends keyof FormConsulta>(key: K, value: FormConsulta[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleExamen(nombre: string) {
    update(
      "examenes",
      form.examenes.includes(nombre)
        ? form.examenes.filter((e) => e !== nombre)
        : [...form.examenes, nombre],
    );
  }

  function agregarMedicamento() {
    if (!nuevoMed.nombre.trim()) return;

    update("medicamentos", [...form.medicamentos, nuevoMed]);
    setNuevoMed({
      nombre: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
      via: "Oral",
      indicaciones: "",
    });
  }

  function quitarMedicamento(index: number) {
    update(
      "medicamentos",
      form.medicamentos.filter((_, i) => i !== index),
    );
  }

  async function guardarConsulta() {
    if (!form.mascotaId) {
      setError("Debes seleccionar una mascota.");
      setStep(1);
      return;
    }

    if (!form.motivoConsulta.trim()) {
      setError("Debes ingresar el motivo de consulta.");
      setStep(1);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const resp = await apiFetch("/consultas", {
        method: "POST",
        body: JSON.stringify({
          mascotaId: Number(form.mascotaId),
          tipoConsulta: form.tipoConsulta,
          estado: form.estado,

          pesoActual: form.pesoActual ? Number(form.pesoActual) : undefined,
          temperatura: form.temperatura ? Number(form.temperatura) : undefined,
          frecuenciaCardiaca: form.frecuenciaCardiaca
            ? Number(form.frecuenciaCardiaca)
            : undefined,
          frecuenciaRespiratoria: form.frecuenciaRespiratoria
            ? Number(form.frecuenciaRespiratoria)
            : undefined,

          trc: form.trc,
          mucosas: form.mucosas,
          motivoConsulta: form.motivoConsulta,
          duracionSintomas: form.duracionSintomas,
          anamnesis: form.anamnesis,
          estadoGeneral: form.estadoGeneral,
          sistemaCardiovascular: form.sistemaCardiovascular,
          sistemaRespiratorio: form.sistemaRespiratorio,
          sistemaDigestivo: form.sistemaDigestivo,
          sistemaNeurologico: form.sistemaNeurologico,
          sistemaMusculoEsqueletico: form.sistemaMusculoEsqueletico,
          pielPelaje: form.pielPelaje,
          diagnosticoPresuntivo: form.diagnosticoPresuntivo,
          diagnosticoDefinitivo: form.diagnosticoDefinitivo,
          indicacionesTutor: form.indicacionesTutor,
          fechaControl: form.fechaControl
            ? new Date(form.fechaControl).toISOString()
            : undefined,
          observacionesCierre: form.observacionesCierre,
        }),
      });

      const consultaId = resp.consulta.id;

      for (const med of form.medicamentos) {
        await apiFetch("/tratamientos", {
          method: "POST",
          body: JSON.stringify({
            consultaId,
            nombre: med.nombre,
            dosis: med.dosis,
            frecuencia: med.frecuencia,
            duracion: med.duracion,
            via: med.via,
            indicaciones: med.indicaciones,
          }),
        });
      }

      for (const examen of form.examenes) {
        await apiFetch("/examenes", {
          method: "POST",
          body: JSON.stringify({
            consultaId,
            nombre: examen,
            tipo: "Complementario",
            estado: "SOLICITADO",
          }),
        });
      }

      if (form.generarReceta) {
        await apiFetch("/recetas", {
          method: "POST",
          body: JSON.stringify({
            consultaId,
            indicaciones: form.indicacionesTutor,
            observaciones: form.observacionesCierre,
          }),
        });
      }

      router.push(`/dashboard/pacientes/${resp.consulta.mascotaId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar consulta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Nueva consulta
            </h1>
            <p className="text-slate-500">
              Registro clínico veterinario por pasos
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Link>
        </div>

        <div className="overflow-x-auto rounded-3xl border bg-white p-4 shadow-sm">
          <div className="flex min-w-max items-center gap-3">
            {STEPS.map((s, i) => {
              const index = i + 1;
              const active = step === index;
              const done = step > index;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => done && setStep(index)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
                    active
                      ? "bg-slate-900 text-white"
                      : done
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <span>{done ? "✓" : index}</span>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {mascotaSeleccionada && step > 1 && (
          <div className="rounded-3xl bg-slate-900 p-5 text-white">
            <p className="font-bold">
              {mascotaSeleccionada.nombre} ·{" "}
              {mascotaSeleccionada.especie?.nombre || "Sin especie"}
            </p>
            <p className="text-sm text-slate-300">
              Tutor: {mascotaSeleccionada.tutor?.nombre}{" "}
              {mascotaSeleccionada.tutor?.apellido || ""} ·{" "}
              {mascotaSeleccionada.tutor?.telefono || "Sin teléfono"}
            </p>
          </div>
        )}

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">
                1. Paciente y motivo
              </h2>

              <input
                placeholder="Buscar mascota o tutor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input"
              />

              <div className="max-h-72 space-y-2 overflow-y-auto">
                {mascotasFiltradas.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => update("mascotaId", String(m.id))}
                    className={`w-full rounded-2xl border px-4 py-3 text-left ${
                      form.mascotaId === String(m.id)
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold">{m.nombre}</p>
                    <p className="text-sm opacity-70">
                      {m.especie?.nombre || "Sin especie"} ·{" "}
                      {m.raza || "Sin raza"} · Tutor: {m.tutor?.nombre}{" "}
                      {m.tutor?.apellido || ""}
                    </p>
                  </button>
                ))}
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Tipo de consulta
                </p>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_CONSULTA.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update("tipoConsulta", t)}
                      className={`rounded-2xl border px-4 py-2 text-sm ${
                        form.tipoConsulta === t
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Campo label="Motivo de consulta *">
                <input
                  className="input"
                  value={form.motivoConsulta}
                  onChange={(e) => update("motivoConsulta", e.target.value)}
                />
              </Campo>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">
                2. Signos vitales
              </h2>

              <div className="grid gap-4 sm:grid-cols-4">
                <Campo label="Peso kg">
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={form.pesoActual}
                    onChange={(e) => update("pesoActual", e.target.value)}
                  />
                </Campo>

                <Campo label="Temperatura °C">
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={form.temperatura}
                    onChange={(e) => update("temperatura", e.target.value)}
                  />
                </Campo>

                <Campo label="FC">
                  <input
                    type="number"
                    className="input"
                    value={form.frecuenciaCardiaca}
                    onChange={(e) =>
                      update("frecuenciaCardiaca", e.target.value)
                    }
                  />
                </Campo>

                <Campo label="FR">
                  <input
                    type="number"
                    className="input"
                    value={form.frecuenciaRespiratoria}
                    onChange={(e) =>
                      update("frecuenciaRespiratoria", e.target.value)
                    }
                  />
                </Campo>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="TRC">
                  <input
                    className="input"
                    value={form.trc}
                    onChange={(e) => update("trc", e.target.value)}
                    placeholder="< 2 seg"
                  />
                </Campo>

                <Campo label="Mucosas">
                  <input
                    className="input"
                    value={form.mucosas}
                    onChange={(e) => update("mucosas", e.target.value)}
                    placeholder="Rosadas húmedas"
                  />
                </Campo>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">3. Anamnesis</h2>

              <Campo label="Duración de síntomas">
                <input
                  className="input"
                  value={form.duracionSintomas}
                  onChange={(e) => update("duracionSintomas", e.target.value)}
                />
              </Campo>

              <Campo label="Anamnesis">
                <textarea
                  rows={7}
                  className="input"
                  value={form.anamnesis}
                  onChange={(e) => update("anamnesis", e.target.value)}
                />
              </Campo>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">
                4. Examen físico
              </h2>

              <Campo label="Estado general">
                <input
                  className="input"
                  value={form.estadoGeneral}
                  onChange={(e) => update("estadoGeneral", e.target.value)}
                />
              </Campo>

              <div className="grid gap-4 sm:grid-cols-2">
                <Area label="Cardiovascular" value={form.sistemaCardiovascular} onChange={(v) => update("sistemaCardiovascular", v)} />
                <Area label="Respiratorio" value={form.sistemaRespiratorio} onChange={(v) => update("sistemaRespiratorio", v)} />
                <Area label="Digestivo" value={form.sistemaDigestivo} onChange={(v) => update("sistemaDigestivo", v)} />
                <Area label="Neurológico" value={form.sistemaNeurologico} onChange={(v) => update("sistemaNeurologico", v)} />
                <Area label="Músculo-esquelético" value={form.sistemaMusculoEsqueletico} onChange={(v) => update("sistemaMusculoEsqueletico", v)} />
                <Area label="Piel y pelaje" value={form.pielPelaje} onChange={(v) => update("pielPelaje", v)} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">
                5. Diagnóstico y tratamiento
              </h2>

              <Campo label="Diagnóstico presuntivo">
                <input
                  className="input"
                  value={form.diagnosticoPresuntivo}
                  onChange={(e) =>
                    update("diagnosticoPresuntivo", e.target.value)
                  }
                />
              </Campo>

              <Campo label="Diagnóstico definitivo">
                <input
                  className="input"
                  value={form.diagnosticoDefinitivo}
                  onChange={(e) =>
                    update("diagnosticoDefinitivo", e.target.value)
                  }
                />
              </Campo>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Exámenes solicitados
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMENES_COMUNES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => toggleExamen(e)}
                      className={`rounded-2xl border px-3 py-1.5 text-xs ${
                        form.examenes.includes(e)
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Medicamentos
                </p>

                <div className="mb-3 space-y-2">
                  {form.medicamentos.map((m, i) => (
                    <div
                      key={`${m.nombre}-${i}`}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <p className="text-sm text-slate-700">
                        <strong>{m.nombre}</strong> · {m.dosis} · {m.frecuencia} ·{" "}
                        {m.duracion}
                      </p>
                      <button
                        type="button"
                        onClick={() => quitarMedicamento(i)}
                        className="text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    placeholder="Medicamento"
                    className="input"
                    value={nuevoMed.nombre}
                    onChange={(e) =>
                      setNuevoMed((m) => ({ ...m, nombre: e.target.value }))
                    }
                  />
                  <input
                    placeholder="Dosis"
                    className="input"
                    value={nuevoMed.dosis}
                    onChange={(e) =>
                      setNuevoMed((m) => ({ ...m, dosis: e.target.value }))
                    }
                  />
                  <input
                    placeholder="Frecuencia"
                    className="input"
                    value={nuevoMed.frecuencia}
                    onChange={(e) =>
                      setNuevoMed((m) => ({ ...m, frecuencia: e.target.value }))
                    }
                  />
                  <input
                    placeholder="Duración"
                    className="input"
                    value={nuevoMed.duracion}
                    onChange={(e) =>
                      setNuevoMed((m) => ({ ...m, duracion: e.target.value }))
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={agregarMedicamento}
                  className="mt-3 rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white"
                >
                  + Agregar medicamento
                </button>
              </div>

              <Campo label="Indicaciones al tutor">
                <textarea
                  rows={4}
                  className="input"
                  value={form.indicacionesTutor}
                  onChange={(e) => update("indicacionesTutor", e.target.value)}
                />
              </Campo>

              <Campo label="Fecha control">
                <input
                  type="date"
                  className="input"
                  value={form.fechaControl}
                  onChange={(e) => update("fechaControl", e.target.value)}
                />
              </Campo>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">6. Resumen</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Resumen label="Paciente" value={mascotaSeleccionada?.nombre || "Sin paciente"} />
                <Resumen label="Tipo" value={form.tipoConsulta} />
                <Resumen label="Motivo" value={form.motivoConsulta || "Sin motivo"} />
                <Resumen label="Diagnóstico" value={form.diagnosticoPresuntivo || "Sin diagnóstico"} />
                <Resumen label="Medicamentos" value={String(form.medicamentos.length)} />
                <Resumen label="Exámenes" value={String(form.examenes.length)} />
              </div>

              <Campo label="Observaciones de cierre">
                <textarea
                  rows={3}
                  className="input"
                  value={form.observacionesCierre}
                  onChange={(e) => update("observacionesCierre", e.target.value)}
                />
              </Campo>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.generarReceta}
                  onChange={(e) => update("generarReceta", e.target.checked)}
                />
                <span className="text-sm text-slate-700">
                  Crear receta asociada a esta consulta
                </span>
              </label>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-slate-700 disabled:opacity-40"
            >
              Anterior
            </button>

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(6, s + 1))}
                className="rounded-2xl bg-slate-900 px-6 py-3 text-white"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={guardarConsulta}
                className="rounded-2xl bg-slate-900 px-8 py-3 text-white disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar consulta"}
              </button>
            )}
          </div>
        </section>
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

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Campo label={label}>
      <textarea
        rows={3}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Campo>
  );
}

function Resumen({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}