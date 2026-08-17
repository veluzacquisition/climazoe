/**
 * URLs de Cloudinary con transformación.
 *
 * Las fotos originales pesan entre 1,8 y 2,8 MB y el video 5,5 MB: puestos
 * tal cual en el hero se comerían la primera pantalla en móvil. Cloudinary
 * los reescala y convierte al vuelo —`f_auto` entrega AVIF o WebP según el
 * navegador— y la misma foto baja a ~316 KB, el video a ~1,1 MB.
 *
 * Se sirven desde Cloudinary y no desde el repo a propósito: es la cuenta de
 * Clima Zoe, entrega por CDN, y evita cargar el repositorio con binarios que
 * habría que reoptimizar a mano en cada cambio.
 */

const CUENTA = 'ydxi3lng';

/** Anchos para el `srcset` del hero, pensados para 1x y 2x. */
const ANCHOS_HERO = [640, 960, 1280, 1600, 1920, 2560];

export interface RecursoCloudinary {
  /** Ruta con versión, tal como la entrega Cloudinary. */
  id: string;
}

function base(tipo: 'image' | 'video', transformacion: string, id: string) {
  return `https://res.cloudinary.com/${CUENTA}/${tipo}/upload/${transformacion}/${id}`;
}

/** Imagen optimizada a un ancho concreto. */
export function imagen(id: string, ancho: number): string {
  return base('image', `f_auto,q_auto,c_fill,w_${ancho}`, id);
}

/** `srcset` para que el navegador elija el ancho según pantalla y densidad. */
export function imagenSrcSet(id: string): string {
  return ANCHOS_HERO.map((w) => `${imagen(id, w)} ${w}w`).join(', ');
}

/** Video optimizado. Se limita a 1280 de ancho: es fondo, no cine. */
export function video(id: string, ancho = 1280): string {
  return base('video', `q_auto,w_${ancho}`, id);
}

/**
 * Fotograma del video como imagen fija.
 *
 * Sirve de `poster` mientras carga y —importante— es lo que se muestra a
 * quien pidió reducir el movimiento del sistema: en ese caso el video no se
 * reproduce nunca.
 */
export function posterDeVideo(id: string, ancho = 1600): string {
  const sinExtension = id.replace(/\.[a-z0-9]+$/i, '');
  return base('video', `so_1,f_auto,q_auto,c_fill,w_${ancho}`, `${sinExtension}.jpg`);
}

/** Recursos del hero. Cambiar una foto es cambiar su id acá. */
export const MEDIA_HERO = {
  panelesTecho: 'v1786994783/Solar_panels_on_roof_2K_202608171426_eemhza.jpg',
  instalacion: 'v1786994785/Solar_panel_installation_on_roof_202608171426_c903np.jpg',
  videoInstalacion: 'v1786995026/Initial_Scene_-_2026-08-17_202608171430_mtetym.mp4',
} as const;
