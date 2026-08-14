import { useState } from 'react';
import Seccion, { TituloSeccion } from '../components/Seccion';
import { site } from '../lib/site.config';

/**
 * Contacto.
 *
 * El formulario no envía a ningún servidor: arma el mensaje y abre WhatsApp,
 * que es por donde el negocio atiende hoy. Preferimos eso a simular un envío
 * que se perdería. Cuando exista la tabla de mensajes en Supabase se cambia
 * el submit y el formulario queda igual.
 */

const MOTIVOS = [
  'Cotizar un sistema solar',
  'Asesoría: no sé qué necesito',
  'Precio de un producto del catálogo',
  'Compra como empresa / mayorista',
  'Servicio o soporte',
] as const;

export default function Contacto() {
  const [nombre, setNombre] = useState('');
  const [motivo, setMotivo] = useState<string>(MOTIVOS[0]);
  const [mensaje, setMensaje] = useState('');

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = [
      `Hola ${site.nombre}, soy ${nombre || 'un interesado'}.`,
      '',
      `• Motivo: ${motivo}`,
      mensaje ? `• Detalle: ${mensaje}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    window.open(
      `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(texto)}`,
      '_blank',
    );
  };

  const tel = (n: string) => n.replace(/\s/g, '');

  return (
    <>
      <Seccion espaciado="amplio">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Hablemos de su <span className="text-marca-texto">proyecto</span>
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-texto-medio">
            Cuéntenos cuánto paga de luz y qué quiere alimentar. La asesoría no
            cuesta y no compromete a nada.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_22rem]">
          {/* --- Formulario ------------------------------------------------ */}
          <form
            onSubmit={enviar}
            className="rounded-marca-lg border border-borde bg-superficie p-7 sm:p-9"
          >
            <h2 className="text-xl font-bold">Escríbanos</h2>
            <p className="mt-1.5 text-sm text-texto-medio">
              Al enviar se abre WhatsApp con el mensaje ya escrito.
            </p>

            <div className="mt-7 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold">Su nombre</span>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre y apellido"
                  className="mt-2 w-full rounded-marca border border-borde bg-fondo px-4 py-3 text-texto placeholder:text-texto-suave focus:border-marca focus:outline-none"
                />
              </label>

              <fieldset>
                <legend className="text-sm font-semibold">¿En qué le ayudamos?</legend>
                <div className="mt-3 space-y-2">
                  {MOTIVOS.map((m) => (
                    <label
                      key={m}
                      className={`flex cursor-pointer items-center gap-3 rounded-marca border px-4 py-3 text-sm transition-colors ${
                        motivo === m
                          ? 'border-marca bg-marca-tenue font-semibold'
                          : 'border-borde bg-fondo hover:border-texto-suave'
                      }`}
                    >
                      <input
                        type="radio"
                        name="motivo"
                        value={m}
                        checked={motivo === m}
                        onChange={() => setMotivo(m)}
                        className="size-4 accent-[var(--marca)]"
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="text-sm font-semibold">Cuéntenos más (opcional)</span>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={4}
                  placeholder="Ej: pago $350.000 de luz al mes en una casa en Mosquera y quiero bajar el recibo."
                  className="mt-2 w-full resize-y rounded-marca border border-borde bg-fondo px-4 py-3 text-texto placeholder:text-texto-suave focus:border-marca focus:outline-none"
                />
              </label>
            </div>

            <button type="submit" className="btn btn-xl btn-primario mt-7 w-full">
              <IconoWhatsApp />
              Enviar por WhatsApp
            </button>
          </form>

          {/* --- Datos de contacto ------------------------------------------ */}
          <aside className="space-y-4">
            <div className="rounded-marca-lg border border-borde bg-fondo p-7">
              <h2 className="text-sm font-bold uppercase tracking-wide text-texto-suave">
                Contacto directo
              </h2>

              <dl className="mt-5 space-y-5 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-texto-suave">
                    Teléfono / WhatsApp
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${tel(site.contacto.telefono)}`}
                      className="text-xl font-extrabold text-marca-texto"
                    >
                      {site.contacto.telefono}
                    </a>
                  </dd>
                  <dd className="mt-1">
                    <a
                      href={`tel:${tel(site.contacto.telefonoSecundario)}`}
                      className="font-semibold text-texto-medio hover:text-marca-texto"
                    >
                      {site.contacto.telefonoSecundario}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-texto-suave">Correo</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${site.contacto.email}`}
                      className="break-all font-semibold text-texto hover:text-marca-texto"
                    >
                      {site.contacto.email}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-texto-suave">Dirección</dt>
                  <dd className="mt-1 font-semibold text-texto">
                    {site.contacto.direccion}
                    <span className="block font-normal text-texto-medio">
                      {site.contacto.ciudad}
                    </span>
                  </dd>
                </div>

                <div className="border-t border-borde-suave pt-4">
                  <dt className="text-xs uppercase tracking-wide text-texto-suave">Empresa</dt>
                  <dd className="mt-1 text-texto-medio">
                    {site.razonSocial}
                    <span className="block">NIT {site.nit}</span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-marca border border-dashed border-acento/40 bg-acento-tenue px-4 py-3">
              <p className="text-xs font-bold text-acento-texto">
                [PENDIENTE: horario de atención]
              </p>
            </div>

            <a
              href={`https://wa.me/${site.contacto.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-urgente w-full"
            >
              Escribir ahora
            </a>
          </aside>
        </div>
      </Seccion>

      <Seccion fondo="alt">
        <TituloSeccion titulo="Dónde estamos" />
        <div className="mt-8 flex min-h-72 items-center justify-center rounded-marca-lg border border-dashed border-borde bg-fondo px-6 text-center text-sm text-texto-suave">
          [PENDIENTE: mapa de {site.contacto.direccion}, {site.contacto.ciudad}]
        </div>
      </Seccion>
    </>
  );
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.43 12.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}
