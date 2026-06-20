"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

function fecha(fecha?: string) {
  if (!fecha) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "UTC",
  }).format(new Date(fecha));
}

export default function FichaPacientePage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function recargarFicha() {
    const resp = await apiFetch(`/mascotas/${id}/ficha-completa`);
    setData(resp);
  }

  useEffect(() => {
    async function cargar() {
      await recargarFicha();
      setLoading(false);
    }

    cargar();
  }, [id]);

  async function marcarVacunaReforzada(vacunaId: number) {
    await apiFetch(`/vacunas/${vacunaId}/reforzar`, {
      method: "PUT",
    });

    await recargarFicha();
  }

  async function marcarDesparasitacionRenovada(desparasitacionId: number) {
    await apiFetch(`/desparasitaciones/${desparasitacionId}/renovar`, {
      method: "PUT",
    });

    await recargarFicha();
  }

  if (loading) return <main className="p-6">Cargando ficha...</main>;

  const {
    mascota,
    tutor,
    antecedenteClinico,
    consultas,
    vacunas,
    desparasitaciones,
    archivos,
    proximaCita,
    resumen,
  } = data;

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/dashboard/pacientes" className="text-sm text-slate-500">
          ← Volver a pacientes
        </Link>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {mascota.nombre}
              </h1>
              <p className="mt-1 text-slate-500">
                {mascota.especie} · {mascota.raza || "Sin raza"} ·{" "}
                {mascota.sexo || "Sin sexo"}
              </p>
            </div>

            <Link
              href={`/dashboard/consultas/nueva?mascotaId=${mascota.id}`}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              + Nueva consulta
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <Info
              label="Peso"
              value={mascota.pesoActual ? `${mascota.pesoActual} kg` : "Sin peso"}
            />
            <Info label="Microchip" value={mascota.microchip || "No registrado"} />
            <Info label="Esterilizado" value={mascota.esterilizado ? "Sí" : "No"} />
            <Info
              label="Próxima cita"
              value={proximaCita ? fecha(proximaCita.fechaInicio) : "Sin cita"}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card title="Tutor">
            <p className="font-semibold text-slate-900">
              {tutor.nombre} {tutor.apellido || ""}
            </p>
            <p className="text-sm text-slate-500">
              {tutor.telefono || "Sin teléfono"}
            </p>
            <p className="text-sm text-slate-500">
              {tutor.email || "Sin email"}
            </p>
            <p className="text-sm text-slate-500">
              {tutor.direccion || "Sin dirección"}
            </p>
          </Card>

          <Card title="Antecedentes clínicos">
            <Dato
              label="Alergias"
              value={antecedenteClinico?.alergias || "Sin alergias registradas"}
            />
            <Dato
              label="Enfermedades previas"
              value={antecedenteClinico?.enfermedadesPrevias || "Sin antecedentes"}
            />
            <Dato
              label="Medicamentos actuales"
              value={antecedenteClinico?.medicamentosActuales || "Ninguno"}
            />
            <Dato
              label="Condición corporal"
              value={
                antecedenteClinico?.condicionCorporal
                  ? `${antecedenteClinico.condicionCorporal}/9`
                  : "Sin registro"
              }
            />
          </Card>

          <Card title="Resumen">
            <Dato label="Consultas" value={resumen.totalConsultas} />
            <Dato label="Vacunas" value={resumen.totalVacunas} />
            <Dato
              label="Desparasitaciones"
              value={resumen.totalDesparasitaciones}
            />
            <Dato label="Archivos" value={resumen.totalArchivos} />
          </Card>
        </section>

        <section className="rounded-3xl border bg-white shadow-sm">
          <Titulo title="Consultas clínicas" />
          <ListaVacia
            visible={consultas.length === 0}
            texto="No hay consultas registradas."
          />

          <div className="divide-y">
            {consultas.map((c: any) => (
              <div key={c.id} className="px-6 py-4">
                <p className="font-semibold text-slate-900">
                  {c.tipoConsulta} · {fecha(c.fechaConsulta)}
                </p>
                <p className="text-sm text-slate-500">
                  {c.diagnosticoPresuntivo || "Sin diagnóstico"} · {c.estado}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {c.motivoConsulta}
                </p>

                <Link
                  href={`/dashboard/consultas/${c.id}`}
                  className="mt-3 inline-block rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Ver detalle
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">Vacunas</h2>
                <p className="text-sm text-slate-400">
                  Registro de vacunas aplicadas
                </p>
              </div>

              <Link
                href={`/dashboard/pacientes/${mascota.id}/vacunas/nueva`}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                + Registrar
              </Link>
            </div>

            {vacunas.length === 0 ? (
              <p className="text-sm text-slate-400">
                No hay vacunas registradas.
              </p>
            ) : (
              <div className="space-y-3">
                {vacunas.map((v: any) => {
                  const estaReforzada = v.estado === "REFORZADA";

                  const estaVencida =
                    !estaReforzada &&
                    v.fechaProximaDosis &&
                    new Date(v.fechaProximaDosis) < new Date();

                  const textoEstado = estaReforzada
                    ? "REFORZADA"
                    : estaVencida
                    ? "VENCIDA"
                    : "VIGENTE";

                  const colorEstado = estaReforzada
                    ? "bg-green-100 text-green-700"
                    : estaVencida
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700";

                  return (
                    <div key={v.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {v.nombre}
                          </p>

                          <p className="text-sm text-slate-500">
                            Aplicada: {fecha(v.fechaAplicacion)}
                          </p>

                          <p className="text-sm text-slate-500">
                            Próxima: {fecha(v.fechaProximaDosis)}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${colorEstado}`}
                          >
                            {textoEstado}
                          </span>
                        </div>

                        {estaVencida && (
                          <button
                            type="button"
                            onClick={() => marcarVacunaReforzada(v.id)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Marcar reforzada
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">
                  Desparasitaciones
                </h2>
                <p className="text-sm text-slate-400">
                  Registro de productos aplicados
                </p>
              </div>

              <Link
                href={`/dashboard/pacientes/${mascota.id}/desparasitaciones/nueva`}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                + Registrar
              </Link>
            </div>

            {desparasitaciones.length === 0 ? (
              <p className="text-sm text-slate-400">
                No hay desparasitaciones registradas.
              </p>
            ) : (
              <div className="space-y-3">
                {desparasitaciones.map((d: any) => {
                  const estaRenovada = d.estado === "RENOVADA";

                  const estaVencida =
                    !estaRenovada &&
                    d.fechaProximaDosis &&
                    new Date(d.fechaProximaDosis) < new Date();

                  const textoEstado = estaRenovada
                    ? "RENOVADA"
                    : estaVencida
                    ? "VENCIDA"
                    : "VIGENTE";

                  const colorEstado = estaRenovada
                    ? "bg-green-100 text-green-700"
                    : estaVencida
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700";

                  return (
                    <div key={d.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {d.producto}
                          </p>

                          <p className="text-sm text-slate-500">
                            Dosis: {d.dosis || "Sin dosis"}
                          </p>

                          <p className="text-sm text-slate-500">
                            Aplicada: {fecha(d.fechaAplicacion)}
                          </p>

                          <p className="text-sm text-slate-500">
                            Próxima: {fecha(d.fechaProximaDosis)}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${colorEstado}`}
                          >
                            {textoEstado}
                          </span>
                        </div>

                        {estaVencida && (
                          <button
                            type="button"
                            onClick={() =>
                              marcarDesparasitacionRenovada(d.id)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Marcar renovada
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </section>

        <section className="rounded-3xl border bg-white shadow-sm">
          <Titulo title="Archivos clínicos" />
          <ListaVacia
            visible={archivos.length === 0}
            texto="No hay archivos registrados."
          />

          <div className="divide-y">
            {archivos.map((a: any) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                className="block px-6 py-4 hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">
                  {a.nombreOriginal}
                </p>
                <p className="text-sm text-slate-500">
                  {a.categoria || "Archivo clínico"}
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      {title && <h2 className="mb-4 font-bold text-slate-900">{title}</h2>}
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Dato({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function Titulo({ title }: { title: string }) {
  return (
    <h2 className="border-b px-6 py-5 font-bold text-slate-900">{title}</h2>
  );
}

function ListaVacia({ visible, texto }: { visible: boolean; texto: string }) {
  if (!visible) return null;
  return <div className="p-6 text-sm text-slate-400">{texto}</div>;
}