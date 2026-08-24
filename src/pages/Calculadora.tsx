import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seccion from '../components/Seccion';
import EncabezadoPagina from '../components/EncabezadoPagina';
import Revelar from '../components/Revelar';
import { site } from '../lib/site.config';
import { precio } from '../lib/formato';
import { registrarSolicitudSolar } from '../lib/pagos';

/** `precio()` admite null; acá los valores siempre existen, así que se fija. */
const pesos = (n: number) => precio(n) ?? '—';
import {
  AREA_PANEL_M2,
  DEPARTAMENTOS_SOLAR,
  FACTOR_CO2_KG_KWH,
  POTENCIA_PANEL_W,
  TIPOS_INSTALACION,
  TIPOS_SISTEMA,
  calcularSolar,
  type TipoSistema,
} from '../lib/solar';

/**
 * Calculadora solar.
 *
 * Sigue el patrón del sitio de referencia: formulario a la izquierda,
 * resultados a la derecha, y hasta que no se calcula hay un marcador en vez
 * de tarjetas vacías.
 *
 * Dos diferencias con la de ellos, ambas deliberadas y explicadas en
 * lib/solar.ts: acá el departamento y el área SÍ cambian el resultado, y el
 * CO₂ sale del factor de emisión real de la red colombiana.
 *
 * El cálculo es local, sin servidor. Los datos sólo salen del navegador si el
 * visitante decide mandarlos por WhatsApp, y en ese caso van en el mensaje
 * que él mismo puede leer antes de enviar.
 */

interface Formulario {
  sistema: TipoSistema;
  consumo: string;
  precioKwh: string;
  area: string;
  porcentaje: string;
  instalacion: string;
  departamento: string;
}

const INICIAL: Formulario = {
  sistema: 'on-grid',
  consumo: '400',
  precioKwh: '900',
  area: '30',
  porcentaje: '70',
  instalacion: 'Hogar',
  departamento: 'Cundinamarca',
};

export default function Calculadora() {
  const [f, setF] = useState<Formulario>(INICIAL);
  const [enviado, setEnviado] = useState(false);

  const numeros = useMemo(
    () => ({
      consumo: Number(f.consumo) || 0,
      precioKwh: Number(f.precioKwh) || 0,
      area: Number(f.area) || 0,
      porcentaje: Number(f.porcentaje) || 0,
    }),
    [f],
  );

  const valido =
    numeros.consumo > 0 &&
    numeros.precioKwh > 0 &&
    numeros.area >= AREA_PANEL_M2 &&
    numeros.porcentaje > 0;

  const resultado = useMemo(
    () =>
      valido
        ? calcularSolar({
            sistema: f.sistema,
            departamento: f.departamento,
            ...numeros,
          })
        : null,
    [valido, f.sistema, f.departamento, numeros],
  );

  const cambiar = (campo: keyof Formulario) => (v: string) => {
    setF((prev) => ({ ...prev, [campo]: v }));
    setEnviado(false);
  };

  const calcular = () => setEnviado(true);
  const r = enviado ? resultado : null;

  return (
    <>
      <EncabezadoPagina
        etiqueta="Herramienta"
        titulo={<>Calculadora <span className="text-marca">solar</span></>}
        bajada="Estime cuántos paneles necesita, cuánto bajaría el recibo y en cuánto tiempo se paga el sistema."
        migas={[{ texto: 'Inicio', a: '/' }, { texto: 'Calculadora' }]}
        alto="compacto"
      />

      <Seccion>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          {/* --- Formulario ------------------------------------------------ */}
          <div className="rounded-marca-lg border border-borde bg-superficie p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight">Configure su sistema</h2>
            <p className="mt-2 leading-relaxed text-texto-medio">
              Los dos primeros datos salen del recibo de la luz: el consumo del
              mes y lo que le cobran por kilovatio-hora.
            </p>

            <div className="mt-7 space-y-6">
              {/* Tipo de sistema, como tarjetas: la diferencia entre on-grid
                  e híbrido decide el precio, así que se explica en vez de
                  esconderla en un desplegable. */}
              <fieldset>
                <legend className="text-sm font-semibold">Tipo de sistema</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {TIPOS_SISTEMA.map((t) => (
                    <label
                      key={t.id}
                      className={`cursor-pointer rounded-marca border p-4 transition-colors ${
                        f.sistema === t.id
                          ? 'border-apoyo bg-apoyo-tenue'
                          : 'border-borde bg-fondo hover:border-apoyo/50'
                      }`}
                    >
                      <span className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="sistema"
                          checked={f.sistema === t.id}
                          onChange={() => cambiar('sistema')(t.id)}
                          className="mt-1 size-4 shrink-0 accent-[var(--apoyo)]"
                        />
                        <span>
                          <span className="block text-sm font-bold">{t.nombre}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-texto-medio">
                            {t.detalle}
                          </span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <Campo
                  id="consumo"
                  etiqueta="Consumo mensual"
                  sufijo="kWh"
                  valor={f.consumo}
                  onCambio={cambiar('consumo')}
                  ayuda="Lo que dice el recibo."
                />
                <Campo
                  id="precio"
                  etiqueta="Precio del kWh"
                  sufijo="COP"
                  valor={f.precioKwh}
                  onCambio={cambiar('precioKwh')}
                  ayuda="Divida el total entre los kWh."
                />
                <Campo
                  id="area"
                  etiqueta="Área disponible"
                  sufijo="m²"
                  valor={f.area}
                  onCambio={cambiar('area')}
                  ayuda={`Cada panel ocupa ~${AREA_PANEL_M2} m².`}
                />
                <Campo
                  id="porcentaje"
                  etiqueta="Cuánto quiere cubrir"
                  sufijo="%"
                  valor={f.porcentaje}
                  onCambio={cambiar('porcentaje')}
                  ayuda="Del total de su recibo."
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Selector
                  id="instalacion"
                  etiqueta="Tipo de instalación"
                  valor={f.instalacion}
                  opciones={[...TIPOS_INSTALACION]}
                  onCambio={cambiar('instalacion')}
                />
                <Selector
                  id="departamento"
                  etiqueta="Departamento"
                  valor={f.departamento}
                  opciones={DEPARTAMENTOS_SOLAR}
                  onCambio={cambiar('departamento')}
                  ayuda="Define cuánto sol recibe al año."
                />
              </div>

              <button
                type="button"
                onClick={calcular}
                disabled={!valido}
                className="btn btn-primario w-full disabled:cursor-not-allowed disabled:opacity-40"
              >
                Calcular
              </button>

              {!valido && (
                <p className="text-sm text-texto-medio">
                  Complete consumo, precio, porcentaje y al menos{' '}
                  {AREA_PANEL_M2} m² de área.
                </p>
              )}
            </div>
          </div>

          {/* --- Resultados ------------------------------------------------ */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {!r ? (
              <div className="flex h-full min-h-[24rem] flex-col items-center justify-center rounded-marca-lg border border-dashed border-borde bg-fondo px-8 py-16 text-center">
                <IconoSol />
                <p className="mt-5 text-lg font-semibold">Su estimación aparece acá</p>
                <p className="mt-2 max-w-xs leading-relaxed text-texto-medio">
                  Complete el formulario y presione Calcular.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold tracking-tight">Su estimación</h2>
                <p className="mt-2 text-sm text-texto-medio">
                  Para {f.departamento}, con {r.hsp} horas de sol pico al día en
                  promedio.
                </p>

                <Revelar
                  key={JSON.stringify(f)}
                  className="mt-6 grid grid-cols-2 gap-4"
                  paso={70}
                >
                  <Dato
                    valor={String(r.paneles)}
                    unidad={`paneles de ${POTENCIA_PANEL_W} W`}
                    etiqueta="Sistema"
                    destacado
                  />
                  <Dato
                    valor={`${r.potenciaKwp}`}
                    unidad="kWp instalados"
                    etiqueta="Potencia"
                  />
                  <Dato
                    valor={pesos(r.ahorroMensual)}
                    unidad="menos en el recibo"
                    etiqueta="Ahorro al mes"
                    destacado
                  />
                  <Dato
                    valor={pesos(r.ahorroAnual)}
                    unidad="acumulado en 12 meses"
                    etiqueta="Ahorro al año"
                  />
                  <Dato
                    valor={
                      r.co2AnualKg >= 1000
                        ? `${(r.co2AnualKg / 1000).toFixed(1)} t`
                        : `${r.co2AnualKg} kg`
                    }
                    unidad="de CO₂ al año"
                    etiqueta="Deja de emitir"
                  />
                  <Dato
                    valor={r.retorno ? `${r.retorno}` : '—'}
                    unidad="años"
                    etiqueta="Retorno de la inversión"
                  />
                </Revelar>

                <dl className="mt-4 space-y-2 rounded-marca-lg border border-borde bg-superficie p-5 text-sm">
                  <Linea
                    k="Genera al mes"
                    v={`${r.generacionMensual.toLocaleString('es-CO')} kWh · cubre el ${r.coberturaReal}% de su recibo`}
                  />
                  <Linea k="Ocupa" v={`${r.areaNecesaria} m² de los ${numeros.area} m² disponibles`} />
                  <Linea
                    k="Inversión de referencia"
                    v={`${pesos(r.inversion)} instalado`}
                  />
                </dl>

                {r.areaInsuficiente && (
                  <p className="mt-4 rounded-marca border border-acento/40 bg-acento-tenue px-4 py-3 text-sm leading-relaxed text-acento-texto">
                    <strong>Con {numeros.area} m² no alcanza</strong> para cubrir
                    el {numeros.porcentaje}% que pidió: caben {r.panelesQueCaben}{' '}
                    paneles y se necesitarían más. El cálculo se ajustó a lo que
                    sí cabe.
                  </p>
                )}

                <p className="mt-5 text-xs leading-relaxed text-texto-suave">
                  Simulación referencial, no es una cotización. Usa promedios de
                  radiación por departamento y costos de mercado; la cifra real
                  depende de su techo, su instalación eléctrica y el equipo que
                  se elija. El CO₂ se calcula con el factor de emisión de la red
                  colombiana ({FACTOR_CO2_KG_KWH} kg por kWh), que es bajo porque
                  la generación del país es mayormente hidráulica.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={enlaceCotizar(f, r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-solar flex-1"
                  >
                    Cotizar por WhatsApp
                  </a>
                  <Link to="/catalogo?categoria=paneles-solares" className="btn btn-contorno flex-1">
                    Ver paneles
                  </Link>
                </div>

                {/* Solicitud formal: el punto de copiar esta calculadora era
                    TOMAR DATOS, no sólo enseñar un número. Quien no quiere
                    abrir WhatsApp deja su contacto acá y el pedido queda
                    guardado con la estimación completa. */}
                <SolicitudCotizacion formulario={f} resultado={r} />
              </div>
            )}
          </div>
        </div>
      </Seccion>
    </>
  );
}

// --- Piezas ----------------------------------------------------------------

function Campo({
  id,
  etiqueta,
  sufijo,
  valor,
  onCambio,
  ayuda,
}: {
  id: string;
  etiqueta: string;
  sufijo: string;
  valor: string;
  onCambio: (v: string) => void;
  ayuda?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {etiqueta}
      </label>
      <div className="mt-2 flex items-center rounded-marca border border-borde bg-fondo focus-within:border-apoyo">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          className="w-full bg-transparent px-4 py-2.5 text-sm tabular-nums text-texto focus:outline-none"
        />
        <span className="shrink-0 px-3 text-xs font-semibold text-texto-suave">{sufijo}</span>
      </div>
      {ayuda && <p className="mt-1.5 text-xs text-texto-suave">{ayuda}</p>}
    </div>
  );
}

function Selector({
  id,
  etiqueta,
  valor,
  opciones,
  onCambio,
  ayuda,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  opciones: string[];
  onCambio: (v: string) => void;
  ayuda?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {etiqueta}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="mt-2 w-full rounded-marca border border-borde bg-fondo px-4 py-2.5 text-sm text-texto focus:border-apoyo focus:outline-none"
      >
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {ayuda && <p className="mt-1.5 text-xs text-texto-suave">{ayuda}</p>}
    </div>
  );
}

function Dato({
  valor,
  unidad,
  etiqueta,
  destacado = false,
}: {
  valor: string;
  unidad: string;
  etiqueta: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`h-full rounded-marca-lg border p-5 ${
        destacado ? 'border-apoyo/30 bg-apoyo-tenue' : 'border-borde bg-fondo'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">
        {etiqueta}
      </p>
      <p
        className={`mt-2 text-2xl font-bold tracking-tight tabular-nums ${
          destacado ? 'text-apoyo' : 'text-texto'
        }`}
      >
        {valor}
      </p>
      <p className="mt-0.5 text-xs text-texto-medio">{unidad}</p>
    </div>
  );
}

function Linea({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
      <dt className="text-texto-suave">{k}</dt>
      <dd className="font-semibold text-texto">{v}</dd>
    </div>
  );
}

function IconoSol() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-12 text-texto-suave"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </svg>
  );
}

/**
 * WhatsApp con la estimación ya escrita. Va todo el detalle para que el
 * asesor no tenga que volver a preguntar lo mismo.
 */
function enlaceCotizar(
  f: Formulario,
  r: ReturnType<typeof calcularSolar>,
): string {
  const texto = [
    'Hola, hice la estimación en la calculadora de la página:',
    '',
    `• ${f.instalacion} en ${f.departamento}`,
    `• Sistema ${f.sistema === 'hibrido' ? 'híbrido con baterías' : 'conectado a la red'}`,
    `• Consumo ${f.consumo} kWh/mes a $${f.precioKwh}/kWh`,
    `• Área disponible ${f.area} m²`,
    '',
    `Me da ${r.paneles} paneles (${r.potenciaKwp} kWp) y un ahorro de ${pesos(
      r.ahorroMensual,
    )} al mes.`,
    '',
    'Quisiera una cotización real.',
  ].join('\n');

  return `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(texto)}`;
}

// ---------------------------------------------------------------------------
// Solicitud de cotización
// ---------------------------------------------------------------------------

/**
 * Captura del contacto, con la estimación adjunta.
 *
 * Se guarda por el mismo camino que un pedido del checkout —la función
 * `crear_pedido` de Supabase— para no montar una segunda tubería ni una
 * segunda tabla. Si Supabase todavía no está conectado, en vez de perder el
 * dato se cae a WhatsApp con todo escrito: es preferible una conversación a
 * un formulario que traga la solicitud en silencio.
 */
function SolicitudCotizacion({
  formulario,
  resultado,
}: {
  formulario: Formulario;
  resultado: ReturnType<typeof calcularSolar>;
}) {
  const [datos, setDatos] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [estado, setEstado] = useState<'inicial' | 'enviando' | 'listo' | 'error'>('inicial');
  const [abierto, setAbierto] = useState(false);

  const completo = datos.nombre.trim().length > 1 && /.+@.+\..+/.test(datos.email);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completo || estado === 'enviando') return;
    setEstado('enviando');

    const guardado = await registrarSolicitudSolar({
      ...datos,
      formulario,
      resultado,
    });
    setEstado(guardado ? 'listo' : 'error');
  };

  if (estado === 'listo') {
    return (
      <div className="mt-6 rounded-marca-lg border border-marca-borde bg-marca-tenue p-6">
        <p className="font-bold text-marca-texto">Solicitud recibida</p>
        <p className="mt-2 text-sm leading-relaxed text-texto-medio">
          Nos llega su estimación con los datos de contacto. Le respondemos con
          una cotización real; si prefiere no esperar, escríbanos por WhatsApp.
        </p>
      </div>
    );
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="mt-4 w-full rounded-marca border border-dashed border-borde py-3 text-sm font-bold text-apoyo transition-colors hover:border-apoyo hover:bg-apoyo-tenue"
      >
        O déjenos sus datos y le enviamos la cotización
      </button>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-6 rounded-marca-lg border border-borde bg-superficie p-6">
      <h3 className="font-bold">Solicitar cotización</h3>
      <p className="mt-1.5 text-sm text-texto-medio">
        Le adjuntamos la estimación que acaba de hacer.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <CampoTexto
          id="sol-nombre"
          etiqueta="Nombre"
          valor={datos.nombre}
          onCambio={(v) => setDatos((d) => ({ ...d, nombre: v }))}
          requerido
        />
        <CampoTexto
          id="sol-email"
          etiqueta="Correo"
          tipo="email"
          valor={datos.email}
          onCambio={(v) => setDatos((d) => ({ ...d, email: v }))}
          requerido
        />
        <CampoTexto
          id="sol-tel"
          etiqueta="Teléfono"
          tipo="tel"
          valor={datos.telefono}
          onCambio={(v) => setDatos((d) => ({ ...d, telefono: v }))}
        />
        <CampoTexto
          id="sol-msg"
          etiqueta="Algo que debamos saber"
          valor={datos.mensaje}
          onCambio={(v) => setDatos((d) => ({ ...d, mensaje: v }))}
        />
      </div>

      <button
        type="submit"
        disabled={!completo || estado === 'enviando'}
        className="btn btn-primario mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}
      </button>

      {estado === 'error' && (
        <p className="mt-3 text-sm leading-relaxed text-acento-texto">
          No pudimos guardar la solicitud.{' '}
          <a
            href={enlaceCotizar(formulario, resultado)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
          >
            Mándenosla por WhatsApp
          </a>{' '}
          y la atendemos igual.
        </p>
      )}

      <p className="mt-3 text-xs leading-relaxed text-texto-suave">
        Usamos sus datos sólo para responderle esta cotización.
      </p>
    </form>
  );
}

function CampoTexto({
  id,
  etiqueta,
  valor,
  onCambio,
  tipo = 'text',
  requerido = false,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  tipo?: string;
  requerido?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {etiqueta}
        {requerido && <span className="text-acento-texto"> *</span>}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        required={requerido}
        onChange={(e) => onCambio(e.target.value)}
        className="mt-2 w-full rounded-marca border border-borde bg-fondo px-4 py-2.5 text-sm text-texto focus:border-apoyo focus:outline-none"
      />
    </div>
  );
}
