// Carpetas de "Trabajos realizados". Para sumar fotos o una carpeta nueva:
// 1) copiar las fotos a public/trabajos/<carpeta>/  2) agregarlas acá con su ancho, alto y descripción.
// El sitio respeta el formato de cada foto (vertical u horizontal): por eso se guarda el tamaño real.

export type WorkPhoto = { src: string; width: number; height: number; alt: string };
export type WorkAlbum = { slug: string; title: string; caption: string; photos: WorkPhoto[] };

const mica = (file: string, width: number, height: number, alt: string): WorkPhoto => ({
  src: `/trabajos/casamiento-mica/${file}`,
  width,
  height,
  alt,
});

export const WORK_ALBUMS: WorkAlbum[] = [
  {
    slug: "casamiento-mica",
    title: "Casamiento de Mica",
    caption: "Peinado de novia · octubre 2026",
    photos: [
      mica("01-novia-sonriendo-de-perfil.jpg", 1200, 1600, "Novia sonriendo de perfil, con peinado semirrecogido y ondas suaves"),
      mica("02-semirrecogido-velo-perlas.jpg", 1200, 1600, "Semirrecogido de novia con velo y ramita de perlas, al aire libre"),
      mica("03-novia-con-sus-damas.jpg", 1200, 1600, "Novia junto a sus tres damas, con peinados y ramos de flores blancas"),
      mica("04-semirrecogido-trenza-perlas.jpg", 1200, 1600, "Peinado de novia semirrecogido con trenza y dos ramitas de perlas"),
      mica("05-velo-lateral-perlas.jpg", 960, 1280, "Peinado de novia visto de costado con velo y ramita de perlas"),
      mica("06-ondas-reflejos-rubios.jpg", 1200, 1600, "Ondas de novia con reflejos rubios y una ramita de perlas"),
      mica("07-novia-y-damas-en-el-living.jpg", 1200, 1600, "La novia y sus damas sonriendo, listas para la ceremonia"),
      mica("08-novia-con-su-peinadora.jpg", 1200, 1600, "Novia sonriendo junto a quien la peinó, con luz de atardecer"),
    ],
  },
];
