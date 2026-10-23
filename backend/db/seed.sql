-- Catálogo inicial: especies que se consiguen en viveros de Colombia.
-- Ejecutar después de schema.sql. Las imágenes son provisionales: reemplazar
-- imagen_url por fotos reales (Unsplash, Cloudinary o /public del frontend).

insert into bonsais (nombre, especie, descripcion, precio, edad_anios, dificultad, luz, frecuencia_riego, imagen_url) values
(
  'Ficus Retusa',
  'Ficus retusa',
  'El bonsái ideal para empezar. Resistente, perdona olvidos de riego y se adapta bien a interiores luminosos.',
  120000, 5, 'facil', 'media', 'cada 3 días',
  'https://placehold.co/600x600/14532d/ffffff?text=Ficus+Retusa'
),
(
  'Ficus Ginseng',
  'Ficus microcarpa',
  'Raíces gruesas y expuestas que le dan un aspecto escultórico. Muy tolerante, perfecto para oficina o apartamento.',
  95000, 4, 'facil', 'media', 'cada 3 días',
  'https://placehold.co/600x600/14532d/ffffff?text=Ficus+Ginseng'
),
(
  'Árbol de la abundancia',
  'Portulacaria afra',
  'Suculenta de hojas pequeñas y carnosas que guarda agua. Casi imposible de matar por falta de riego.',
  85000, 3, 'facil', 'sol_directo', 'cada 7 días',
  'https://placehold.co/600x600/14532d/ffffff?text=Portulacaria'
),
(
  'Carmona',
  'Carmona retusa',
  'También llamado té de Fukien. Hojas brillantes y pequeñas flores blancas casi todo el año. Pide humedad constante.',
  160000, 6, 'media', 'media', 'cada 2 días',
  'https://placehold.co/600x600/14532d/ffffff?text=Carmona'
),
(
  'Olmo chino',
  'Ulmus parvifolia',
  'Corteza que se descama con los años y ramificación muy fina. Agradece el aire libre y responde muy bien a la poda.',
  210000, 8, 'media', 'sol_directo', 'cada 2 días',
  'https://placehold.co/600x600/14532d/ffffff?text=Olmo+Chino'
),
(
  'Buganvilla',
  'Bougainvillea glabra',
  'Estalla en flores fucsia con el sol del trópico. Necesita exterior, mucha luz y poda frecuente para mantener la forma.',
  180000, 7, 'media', 'sol_directo', 'cada 2 días',
  'https://placehold.co/600x600/14532d/ffffff?text=Buganvilla'
),
(
  'Serissa',
  'Serissa japonica',
  'La "árbol de las mil estrellas": se cubre de flores diminutas. Delicada con los cambios de lugar y de riego.',
  140000, 5, 'dificil', 'media', 'cada 2 días',
  'https://placehold.co/600x600/14532d/ffffff?text=Serissa'
),
(
  'Junípero',
  'Juniperus procumbens ''Nana''',
  'La conífera clásica del bonsái. Solo vive al aire libre y a pleno sol; exige paciencia y alambrado cuidadoso.',
  320000, 10, 'dificil', 'sol_directo', 'cada 2 días',
  'https://placehold.co/600x600/14532d/ffffff?text=Junipero'
);
