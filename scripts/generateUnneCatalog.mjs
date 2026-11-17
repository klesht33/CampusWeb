import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = 'C:\\Users\\cuent\\Documents\\UNNE\\UNNE-LSI-main\\UNNE-LSI-main';

const SUBJECT_FOLDER_MAP = {
  'Algoritmo y Estructura de datos 1': 'algoritmos-1',
  'Algebra': 'algebra',
  'Algoritmo y Estructura de datos 2': 'algoritmos-2',
  'Logica y Matematica Computacional': 'logica-computacional',
  'Sistemas y Organizaciones': 'sistemas-organizaciones',
  'Paradigmas y Lenguajes': 'paradigmas',
  'Arquitectura de computadoras': 'arquitectura',
  'Calculo': 'calculo',
  'Programacion Orientada a Objetos': 'paradigmas-poo',
  'Sistemas Operativos': 'sistemas-operativos',
  'Bases de Datos 1': 'base-de-datos-1',
  'Administracion y Gestion de Organizaciones': 'administracion-gestion',
  'Comunicacion de datos 1': 'comunicaciones-datos',
  'Ingenieria de Software 1': 'ingenieria-software',
  'Taller de Programacion 1': 'taller-programacion-1',
  'Probabilidad y Estadistica': 'probabilidad-estadistica',
  'Ingenieria de Software 2': 'ingenieria-software-2',
  'Taller de Programacion 2': 'taller-programacion-2',
  'Ingles Tecnico': 'ingles-tecnico',
  'Teoria de la Computacion': 'teoria-computacion',
  'Economia Aplicada': 'economia-aplicada',
  'Redes de Datos': 'redes-datos',
  'Bases de Datos 2': 'bases-de-datos-2',
};

const JUNK_EXTENSIONS = new Set([
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.msi',
  '.pdb',
  '.cache',
  '.suo',
  '.wsuo',
  '.vsidx',
  '.bkp',
  '.v2',
  '.dtmp',
  '.up2date',
  '.gch',
  '.resources',
  '.csproj',
  '.sln',
  '.targets',
  '.props',
  '.user',
  '.editorconfig',
  '.resx',
  '.bin',
  '.obj',
  '.ilk',
  '.exp',
  '.lib',
  '.o',
  '.gitattributes',
  '.gitignore',
]);

const JUNK_FILENAMES = new Set(['thumbs.db', '.ds_store', 'desktop.ini', '.lsp']);

/**
 * Overrides explícitos verificados manualmente sobre archivos con nombres ambiguos,
 * hashes, códigos internos o mal ubicados en subcarpetas.
 * Mantiene intacto `relativePath` en el catálogo; solo ajusta el título visible (`name`),
 * y opcionalmente `category` y `parcialInstance` (`null` elimina la etiqueta de parcial).
 */
const MANUAL_FILE_OVERRIDES = {
  // === Administracion y Gestion de Organizaciones ===
  'Materias/Administracion y Gestion de Organizaciones/material/a2c87d7e-24f7-46c5-b498-e0e019c01c5e.jpg': {
    name: 'Cursograma de Compras - Ejercicio Resuelto con Glosario.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Administracion y Gestion de Organizaciones/material/WhatsApp Image 2024-10-30 at 21.57.57.jpeg': {
    name: 'Cursograma de Producción y Almacenes - Ejercicio Resuelto.jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Administracion y Gestion de Organizaciones/material/WhatsApp Image 2024-10-30 at 23.13.34.jpeg': {
    name: 'Apuntes de Cursograma - Simbología y Manual de Procedimientos.jpeg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/PHOTO-2024-09-26-16-56-45.jpg': {
    name: '1° Parcial Práctico Organigrama - Caso PANYPAN S.A..jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/PHOTO-2024-09-26-16-58-00.jpg': {
    name: '1° Parcial Práctico Organigrama - Caso PANYPAN S.A. (Vista Ampliada).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/PHOTO-2024-10-30-12-15-27.jpg': {
    name: '2° Parcial Práctico Cursograma - Caso LavaHelAire S.R.L..jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/practica/cursograma/Imagen de WhatsApp 2023-10-21 a las 12.58.32_90d01c71.jpg': {
    name: 'Tips de Cursograma - Errores Habituales y Controles.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/Imagen de WhatsApp 2023-10-31 a las 15.49.38_56f9dbfd.jpg': {
    name: 'Tips de Cursograma - Errores Habituales (Pizarrón).jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/Imagen de WhatsApp 2023-10-31 a las 19.05.29_74d5445f.jpg': {
    name: 'Apunte Sistema Financiero - Capital y Cobranzas.jpg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/Imagen de WhatsApp 2023-11-02 a las 21.39.00_2d66429e.jpg': {
    name: 'Reglas Generales de Cursograma y Control Cruzado (Apuntes).jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/Imagen de WhatsApp 2023-11-02 a las 21.39.16_6a994c55.jpg': {
    name: 'Errores Habituales en Cursogramas (Apuntes Manuscritos).jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/IMG-20230925-WA0038.jpg': {
    name: 'Pregunta 2° Parcial Teórico - Elementos del Control.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/IMG-20230926-WA0023.jpg': {
    name: 'Pregunta 1° Parcial Teórico - Concepto de Estrategia.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/IMG-20231002-WA0005.jpg': {
    name: 'Pregunta 2° Parcial Teórico - Tipos de Control Organizacional.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/IMG-20231002-WA0006.jpg': {
    name: 'Pregunta 2° Parcial Teórico - Sistema Financiero (V o F).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/IMG-20231002-WA0007.jpg': {
    name: '2° Parcial Teórico (2022) - Pregunta 4 Circuito Administrativo y Organigrama.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/IMG-20231002-WA0012.jpg': {
    name: 'Pregunta 2° Parcial Teórico - Limitaciones Factor Humano y Departamentalización.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-09-26-18-33-49.jpg': {
    name: '1° Parcial Teórico - Perfil Epistemológico de la Administración (Móvil).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-09-26-18-33-50.jpg': {
    name: '1° Parcial Teórico - Qué es Descentralizar.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-09-26-18-33-51.jpg': {
    name: '1° Parcial Teórico - Método Analítico de la Administración (Móvil).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-09-26-18-33-52.jpg': {
    name: '1° Parcial Teórico - Administración Ciencia Técnica o Arte (Móvil).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-09-10-43-00.jpg': {
    name: '1° Parcial Teórico - Pregunta 2 Definición de Organización.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-09-10-43-00(1).jpg': {
    name: '1° Parcial Teórico - Pregunta 1 Administración como Ciencia.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-09-10-43-01.jpg': {
    name: '1° Parcial Teórico - Aspecto Vital Análisis Administrativo.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-09-10-43-02.jpg': {
    name: '1° Parcial Teórico - Pregunta 6 Ciencia Técnica o Arte.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-09-10-43-02(1).jpg': {
    name: '1° Parcial Teórico - Pregunta 5 Método de la Administración.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-09-10-43-03.jpg': {
    name: '1° Parcial Teórico - Perfil Epistemológico de la Administración.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-50.jpg': {
    name: '2° Parcial Teórico - Objetivo del Sistema Financiero (V o F).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-51.jpg': {
    name: '2° Parcial Teórico - Tipos de Control Organizacional.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-52.jpg': {
    name: '1° Parcial Teórico - Concepto de Estrategia y Elementos.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-53.jpg': {
    name: '2° Parcial Teórico - Limitaciones Organigrama (Factor Humano y Jerarquía).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-54.jpg': {
    name: '2° Parcial Teórico - Relación Sistema de Información y Control.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-55.jpg': {
    name: '2° Parcial Teórico - Pregunta 4 Limitaciones del Flujograma.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-55(1).jpg': {
    name: '2° Parcial Teórico - Pregunta 2 Objetivo de la Motivación.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-56.jpg': {
    name: '2° Parcial Teórico - Estructuras de Contingencia (V o F).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-56(1).jpg': {
    name: '1° Parcial Teórico - Qué es la Estrategia.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-57.jpg': {
    name: '2° Parcial Teórico - Los Elementos del Control.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-57(1).jpg': {
    name: 'Práctico 10 Análisis de Procedimientos y Sistema de Control.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-58.jpg': {
    name: '1° Parcial Teórico - Qué es la Estrategia (Copia).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-58(1).jpg': {
    name: '2° Parcial Teórico - Tipos de Control Organizacional (Copia).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-59.jpg': {
    name: '2° Parcial Teórico - Objetivo del Análisis de Procedimientos (V o F).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-12-59(1).jpg': {
    name: '2° Parcial Teórico - Definición de Control y Evaluación de Desvíos (V o F).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-30-21-16-38.jpg': {
    name: '1° Parcial Teórico - Qué es Estrategia (Plan y Entorno).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Administracion y Gestion de Organizaciones/parciales/preguntas del parcial teorico/PHOTO-2024-10-31-08-45-26.jpg': {
    name: '2° Parcial Teórico - Estructuras de Contingencia (V o F - Copia).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },

  // === Algebra ===
  'Materias/Algebra/Apuntes/CamScanner 06-30-2022 12.33.pdf': {
    name: 'Apuntes Manuscritos - Lógica, Conjuntos y Relaciones.pdf',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Algebra/Apuntes/apunte_b1d6fd32726466bde7200ce9c060d206.pdf': {
    name: 'ÁLGEBRA I - Apunte Completo (Lógica a Polinomios).pdf',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-05-19-00-57-57.jpg': {
    name: '2° Parcial Álgebra (16-06-2022) - Tema 3.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-06-15-12-34-30.jpg': {
    name: '2° Parcial Álgebra (16-06-2022) - Tema 1.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-06-15-12-34-30 2.jpg': {
    name: '2° Parcial Álgebra (16-06-2022) - Tema 3 (Copia).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-06-15-12-34-30 3.jpg': {
    name: '2° Parcial Álgebra (16-06-2022) - Tema 2.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-07-03-18-58-53.jpg': {
    name: 'Examen Final Álgebra LSI (Hoja Amarilla).jpg',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-07-04-12-30-12.jpg': {
    name: 'Examen Final Álgebra LSI - Lógica, Inducción, Rouché y Cónicas.jpg',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-07-08-23-09-01.jpg': {
    name: 'Examen Final Álgebra LSI - Conjuntos, Combinatoria e Hipérbola.jpg',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-07-21-12-39-53.jpg': {
    name: 'Examen Final Álgebra LSI - Conjuntos, Newton e Inducción (Hoja Amarilla).jpg',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-08-14-16-09-28.jpg': {
    name: 'Examen Libre Álgebra LSI - Lógica, Inducción y Cramer.jpg',
    category: 'Exámenes Libres',
    parcialInstance: null,
  },
  'Materias/Algebra/Parciales viejos/PHOTO-2023-08-24-08-31-50.jpg': {
    name: 'Examen Final Regulares Álgebra LSI (01-08-2023).jpg',
    category: 'Finales',
    parcialInstance: null,
  },

  // === Algoritmo y Estructura de datos 1 ===
  'Materias/Algoritmo y Estructura de datos 1/Clases de Algoritmo/17.03.23.txt': {
    name: 'Clase 17-03-2023 - Metodología de Pensamiento Computacional y Algoritmia.txt',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Algoritmo y Estructura de datos 1/Clases de Algoritmo/22.03.23.txt': {
    name: 'Clase 22-03-2023 - Componentes de un Programa y Expresiones.txt',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Algoritmo y Estructura de datos 1/Clases de Algoritmo/29.03.23.docx': {
    name: 'Clase 29-03-2023 - Expresiones Lógicas y Casos de Prueba.docx',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Algoritmo y Estructura de datos 1/Clases de Algoritmo/31.03.23.docx': {
    name: 'Clase 31-03-2023 - Convenciones de Identificadores y Expresiones.docx',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Algoritmo y Estructura de datos 1/Clases de Algoritmo/05.04.23.docx': {
    name: 'Clase 05-04-2023 - Tipos de Datos, printf y scanf (TP 3).docx',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Algoritmo y Estructura de datos 1/Clases de Algoritmo/Orban_Fernandez.docx': {
    name: 'Entrenamiento 2023 - Sistema de Taxi CABA (Orban y Fernández).docx',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },

  // === Algoritmo y Estructura de datos 2 ===
  'Materias/Algoritmo y Estructura de datos 2/1er Parcial/PHOTO-2025-09-14-18-53-02.jpg': {
    name: '1° Parcial Algoritmos II (19-09-2023) - Tema 1 (Vuelos y ABB Procesos).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Algoritmo y Estructura de datos 2/1er Parcial/PHOTO-2025-09-14-18-53-03.jpg': {
    name: '1° Parcial Algoritmos II - Pilas Llamadas Móvil y ABB Estudiantes.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Algoritmo y Estructura de datos 2/1er Parcial/PHOTO-2025-09-14-18-53-03(1).jpg': {
    name: '1° Parcial Algoritmos II (19-09-2023) - Tema 1 Monitor (Vuelos y Recursividad).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Algoritmo y Estructura de datos 2/1er Parcial/PHOTO-2025-09-14-18-53-13.jpg': {
    name: '1° Parcial Algoritmos II (19-09-2023) - Tema 2 Monitor (Colas Mercado Libre).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Algoritmo y Estructura de datos 2/1er Parcial/PHOTO-2025-09-14-18-53-14.jpg': {
    name: '1° Parcial Algoritmos II - Listas ANSES y ABB Colaboraciones GitHub.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Algoritmo y Estructura de datos 2/1er Parcial/PHOTO-2025-09-14-18-53-15.jpg': {
    name: '1° Parcial Algoritmos II (27-09-2022) - Tema 1 (Bebidas, Escritorios y Corte ML).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Algoritmo y Estructura de datos 2/1er Parcial/PHOTO-2025-09-14-18-53-16.jpg': {
    name: '1° Parcial Algoritmos II (27-09-2022) - Tema 2 (Lácteos, Escritorios y Corte ML).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Algoritmo y Estructura de datos 2/borradores/ejemplos del profe/archivos(cancion)/1_LeerCancion.c': {
    name: 'Ejemplo Leer Canción (Archivos en C).c',
  },

  // === Arquitectura de computadoras ===
  'Materias/Arquitectura de computadoras/Actividades practicas/2.s': {
    name: 'Ejercicio 2 Assembler ARM - Multiplicación con Subrutina.s',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Actividades practicas/ba00ae05-78a7-48ac-9799-7c882ebc9e98.jpg': {
    name: 'Gráfico Tiempo de Acceso vs HIT Ratio Caché.jpg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Actividades practicas/disco/1.png': {
    name: 'Problema Disco Magnético N° 1.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Actividades practicas/disco/2.png': {
    name: 'Problema Disco Magnético N° 2.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Actividades practicas/disco/3.png': {
    name: 'Problema Disco Magnético N° 3.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Actividades practicas/disco/4.png': {
    name: 'Problema Disco Magnético N° 4.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Actividades practicas/disco/5.png': {
    name: 'Problema Disco Magnético N° 5.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Actividades practicas/disco/6.png': {
    name: 'Problema Disco Magnético N° 6.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Actividades practicas/disco/7.png': {
    name: 'Problema Disco Magnético N° 7.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/1472224285series-arquitecturapdf.pdf': {
    name: 'Series de Trabajos Prácticos Resueltas (Guías 2 a 7) - Arquitectura y Organización.pdf',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/Tema 2/ejercicios/WhatsApp Image 2023-04-03 at 5.58.02 PM.jpeg': {
    name: 'Tema 2 Ej. 4 (Pág. 2) - Verificación Suma Punto Flotante en Base 10.jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/Tema 2/ejercicios/WhatsApp Image 2023-04-03 at 5.58.02 PM (1).jpeg': {
    name: 'Tema 2 Ej. 4 (Pág. 1) - Suma en Punto Flotante con Exceso y Bit Oculto.jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/Tema 2/ejercicios/WhatsApp Image 2023-04-03 at 5.58.03 PM.jpeg': {
    name: 'Tema 2 Ej. 2 - Representación Punto Flotante IEEE 754 (38,0D9F)16.jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/Tema 2/ejercicios/WhatsApp Image 2023-04-03 at 5.58.03 PM (1).jpeg': {
    name: 'Tema 2 Ej. 9 - Suma en Complemento a 1 (Ca1) en 8 bits.jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/Tema 2/ejercicios/WhatsApp Image 2023-04-03 at 5.58.05 PM.jpeg': {
    name: 'Tema 2 Ej. 9 - Suma en Ca1 de (1011100)2 y (110101)2 con Overflow.jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/Tema 2/ejercicios/WhatsApp Image 2023-04-03 at 5.58.05 PM (1).jpeg': {
    name: 'Tema 2 Ej. 3 (Pág. 2) - Alineación y Suma de Mantisas en Ca1.jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/Tema 2/ejercicios/WhatsApp Image 2023-04-03 at 5.58.06 PM.jpeg': {
    name: 'Tema 2 Ej. 3 (Pág. 1) - Suma en Punto Flotante (Mantisa Ca1, Exponente BSS).jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/Tema 2/ejercicios/WhatsApp Image 2023-04-03 at 5.58.06 PM (1).jpeg': {
    name: 'Tema 2 Ej. 1 - Conversión Decimal 9,375e-2 a Punto Flotante Normalizado.jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/Tema 2/ejercicios/WhatsApp Image 2023-04-04 at 5.08.02 PM.jpeg': {
    name: 'Tema 2 Ej. 4b - Verificación Suma en Punto Flotante (1,625).jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Arquitectura de computadoras/Material/WhatsApp Image 2023-04-19 at 12.32.55 PM.jpeg': {
    name: '1° Parcial Arquitectura (24-05-2022) - Pregunta 1 Completar Bucle ARM.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/Material/WhatsApp Image 2023-04-19 at 12.33.40 PM.jpeg': {
    name: '1° Parcial Arquitectura (24-05-2022) - Pregunta 2 Llamada a Subrutina (PC en LR).jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/Material/WhatsApp Image 2023-04-19 at 12.33.40 PM (1).jpeg': {
    name: '1° Parcial Arquitectura (24-05-2022) - Pregunta 3 Pasaje de Parámetros por Valor en Registros.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/Material/WhatsApp Image 2023-04-19 at 12.33.41 PM.jpeg': {
    name: '1° Parcial Arquitectura (24-05-2022) - Pregunta 4 Registros de CPU (MBR, MAR, SP, IR, PC, IX).jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/Material/WhatsApp Image 2023-04-19 at 12.33.42 PM.jpeg': {
    name: '1° Parcial Arquitectura (24-05-2022) - Pregunta 5 Modos de Direccionamiento vs Operaciones.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/Material/WhatsApp Image 2023-04-19 at 12.33.42 PM (1).jpeg': {
    name: '1° Parcial Arquitectura (24-05-2022) - Pregunta 6 Etapas del Proceso de Interrupción.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/Material/WhatsApp Image 2023-04-19 at 12.33.42 PM (2).jpeg': {
    name: '1° Parcial Arquitectura (24-05-2022) - Pregunta 7 Instrucción Llamada a Subrutina.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/Material/WhatsApp Image 2023-04-19 at 12.33.43 PM.jpeg': {
    name: '1° Parcial Arquitectura (24-05-2022) - Pregunta 8 Efecto de ldr r1, =oper1.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/Material/WhatsApp Image 2023-04-19 at 12.33.43 PM (1).jpeg': {
    name: '1° Parcial Arquitectura (24-05-2022) - Pregunta 10 Entradas y Salidas Unidad de Control.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Capturas/Captura de pantalla 2023-05-10 084639.jpg': {
    name: '1° Parcial Arquitectura Moodle - Pregunta 1 Entradas y Salidas Unidad de Control.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Capturas/Captura de pantalla 2023-05-10 084707.jpg': {
    name: '1° Parcial Arquitectura Moodle - Pregunta 2 Instrucción str r0, [r2].jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Capturas/Captura de pantalla 2023-05-10 084727.jpg': {
    name: '1° Parcial Arquitectura Moodle - Pregunta 3 Pasaje de Parámetros en ARM.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Capturas/Captura de pantalla 2023-05-10 084748.jpg': {
    name: '1° Parcial Arquitectura Moodle - Pregunta 4 Llamada a Subrutina.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Capturas/Captura de pantalla 2023-05-10 084807.jpg': {
    name: '1° Parcial Arquitectura Moodle - Pregunta 5 Modos de Direccionamiento vs Operaciones.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Capturas/Captura de pantalla 2023-05-10 084826.jpg': {
    name: '1° Parcial Arquitectura Moodle - Pregunta 6 Completar Bucle ARM.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Capturas/Captura de pantalla 2023-05-10 084843.jpg': {
    name: '1° Parcial Arquitectura Moodle - Pregunta 7 Componentes de la CPU.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Capturas/Captura de pantalla 2023-05-10 084927.jpg': {
    name: '1° Parcial Arquitectura Moodle - Pregunta 8 Etapas Ciclo de Instrucción.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Capturas/Captura de pantalla 2023-05-10 084958.jpg': {
    name: '1° Parcial Arquitectura Moodle - Pregunta 9 y 10 Llamada bl y Buses del Sistema.jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Parcial Arqui/WhatsApp Image 2023-05-08 at 12.57.24 PM.jpeg': {
    name: '1° Parcial Arquitectura Móvil (24-05-2022) - Pregunta 2 Llamada a Subrutina.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Parcial Arqui/WhatsApp Image 2023-05-08 at 12.57.24 PM (1).jpeg': {
    name: '1° Parcial Arquitectura Móvil (24-05-2022) - Pregunta 1 Completar Bucle ARM.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Parcial Arqui/WhatsApp Image 2023-05-08 at 12.57.25 PM.jpeg': {
    name: '1° Parcial Arquitectura Móvil (24-05-2022) - Pregunta 3 Pasaje de Parámetros ARM.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Parcial Arqui/WhatsApp Image 2023-05-08 at 12.57.25 PM (1).jpeg': {
    name: '1° Parcial Arquitectura Móvil (24-05-2022) - Pregunta 4 Registros de CPU.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Parcial Arqui/WhatsApp Image 2023-05-08 at 12.57.26 PM.jpeg': {
    name: '1° Parcial Arquitectura Móvil (24-05-2022) - Pregunta 5 Modos de Direccionamiento vs Operaciones.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Parcial Arqui/WhatsApp Image 2023-05-08 at 12.57.26 PM (1).jpeg': {
    name: '1° Parcial Arquitectura Móvil (24-05-2022) - Pregunta 7 Instrucción Llamada a Subrutina.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Parcial Arqui/WhatsApp Image 2023-05-08 at 12.57.27 PM.jpeg': {
    name: '1° Parcial Arquitectura Móvil (24-05-2022) - Pregunta 8 y 9 ldr r1 y Componentes CPU.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Parcial Arqui/WhatsApp Image 2023-05-08 at 12.57.27 PM (1).jpeg': {
    name: '1° Parcial Arquitectura Móvil (24-05-2022) - Pregunta 8 Efecto de ldr r1, =oper1.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Arquitectura de computadoras/parciales/Primer Parcial/Parcial Arqui/WhatsApp Image 2023-05-08 at 12.57.28 PM.jpeg': {
    name: '1° Parcial Arquitectura Móvil (24-05-2022) - Pregunta 10 Entradas y Salidas UC.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },

  // === Bases de Datos 2 ===
  'Materias/Bases de Datos 2/Parciales/WhatsApp Image 2022-10-04 at 13.03.25.jpeg': {
    name: '1° Parcial Bases de Datos II (03-10-2022) - Tema 01.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Bases de Datos 2/Practicos/1resolucion.pdf': {
    name: 'Resolución Práctico 1.pdf',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Bases de Datos 2/Practicos/1_tpScript.sql': {
    name: 'TP - Script SQL de Práctica.sql',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Bases de Datos 2/Practicos/2_resolucion_practico2.pdf': {
    name: 'Resolución Práctico 2.pdf',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Bases de Datos 2/Practicos/3Bd2_resolucion_practico3.pdf': {
    name: 'Resolución Práctico 3.pdf',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Bases de Datos 2/Practicos/4Bd2_resolucion_practico4.pdf': {
    name: 'Resolución Práctico 4.pdf',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Bases de Datos 2/Practicos/4cBd2_resolucion_practico4_complementarios.pdf': {
    name: 'Resolución Práctico 4 Complementarios.pdf',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Bases de Datos 2/Parciales/BD2_Tema01_PrimerParcial_resolución_modeloresolucion1.pdf': {
    name: '1° Parcial BD2 - Tema 01 Resolución Modelo 1.pdf',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },

  // === Calculo ===
  'Materias/Calculo/fotos demostraciones 2026/unidad 1/WhatsApp Image 2026-03-19 at 21.34.02 (1).jpeg': {
    name: 'Demostración Unidad 1 - Teorema Unicidad del Límite.jpeg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Calculo/fotos demostraciones 2026/unidad 1/WhatsApp Image 2026-03-19 at 21.34.02 (3).jpeg': {
    name: 'Pizarrón Unidad 1 - Intervalos y Desigualdad Triangular.jpeg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Calculo/fotos ejemplos 2026/unidad 1/WhatsApp Image 2026-03-19 at 21.34.01.jpeg': {
    name: 'Ejemplo Unidad 1 - Clasificación de Funciones (Inyectiva, Sobreyectiva, Biyectiva).jpeg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Calculo/fotos ejemplos 2026/unidad 1/WhatsApp Image 2026-03-19 at 21.34.02 (2).jpeg': {
    name: 'Ejemplo Unidad 1 - Existencia y Unicidad de Funciones.jpeg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Calculo/fotos ejemplos 2026/unidad 1/WhatsApp Image 2026-03-19 at 21.34.02.jpeg': {
    name: 'Ejemplo Unidad 1 - Punto de Acumulación y Límite de una Función.jpeg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Calculo/Modelos Parciales/Parciales 2025/IMG-20250515-WA0061.jpg': {
    name: '1° Parcial Cálculo (17-05-2023) - Tema 1 Manuscrito (Continuidad, Límites, Derivadas e Integrales).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Primer Parcial/Resolucion 1.jpeg': {
    name: 'Resolución 1° Parcial (17-05-2023) - Ej. 3 y 4 Tema 2 (Tangente, Máximos y P. Críticos).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Primer Parcial/Resolucion 2.jpeg': {
    name: 'Resolución 1° Parcial (17-05-2023) - Ej. 1 y 2 Tema 2 (Continuidad y Límites).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Primer Parcial/Resolucion 3.jpeg': {
    name: 'Resolución 1° Parcial (17-05-2023) - Ej. 4 y 5 Tema 1 (P. Inflexión e Integrales).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Primer Parcial/WhatsApp Image 2024-05-10 at 10.21.46.jpeg': {
    name: '1° Parcial Práctico Cálculo - Modelo 1 (Discontinuidad, Límites, Tangente y Extremos).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Primer Parcial/WhatsApp Image 2024-05-10 at 10.23.07.jpeg': {
    name: '1° Parcial Práctico Cálculo - Modelo 2 (Continuidad, Límite, Diferenciales y Extremos).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Primer Parcial/WhatsApp Image 2024-05-10 at 10.53.11.jpeg': {
    name: '1° Parcial Cálculo (17-05-2023) - Tema 1 Impreso.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Primer Parcial/WhatsApp Image 2024-05-10 at 10.53.12 (1).jpeg': {
    name: '1° Parcial Cálculo (17-05-2023) - Tema 2 Impreso.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Primer Parcial/WhatsApp Image 2024-05-10 at 10.53.12.jpeg': {
    name: 'Recuperatorio 1° Parcial Cálculo (31-05-2023) - Temas 1 y 2.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Primer Parcial/WhatsApp Image 2024-05-10 at 17.50.34.jpeg': {
    name: 'Recuperatorio 1° Parcial Cálculo (31-05-2023) - Temas 1 y 2 (Copia).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/18781a0e-cfd0-4eed-a5b2-cf9613139ad9.jpg': {
    name: 'Resolución Recuperatorio 2° Parcial (Prof. Largosta) - Ej. 2 y 4 Tema 2 (Primitivas y Derivadas Parciales).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/29ecef20-4292-4c62-9f8f-d0db6c983125.jpg': {
    name: 'Resolución Recuperatorio 2° Parcial (Prof. Largosta) - Ej. 3 y 5 Tema 2 (Límite Doble y Extremos).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/7e790320-2e1c-4471-a062-066469213a65.jpg': {
    name: 'Recuperatorio 2° Parcial Cálculo (Prof. Largosta) - Tema 2 y Resolución Ej. 1.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/be46d3d2-ef22-46c8-896a-d970251b704f.jpg': {
    name: '2° Parcial Cálculo - Temas 1 y 2 (Integrales, Áreas, Límite Doble y Extremos).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/c0e798ff-51d7-4890-aa62-0e25bd9233ae.jpg': {
    name: 'Resolución 2° Parcial Cálculo - Tema 2 Completo.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/ed216d29-380c-4b4a-abd3-0b73d96d1169.jpg': {
    name: 'Resolución Recuperatorio 2° Parcial (Prof. Largosta) - Ej. 1 Tema 1 (Área y Volumen).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/f5eeeacc-bd2a-4c0e-83d1-713937819af6.jpg': {
    name: 'Resolución 2° Parcial Cálculo - Tema 1 Completo.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/2do parcial modelo largosta/b776627b-aef3-44fd-a550-373e99598d03.jpg': {
    name: 'Recuperatorio 2° Parcial Cálculo (Prof. Largosta) - Temas 1 y 2.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/2do parcial modelo largosta/resolucion1.jpg': {
    name: 'Resolución Recuperatorio 2° Parcial (Prof. Largosta) - Ej. 1 a 3 Tema 1.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/2do parcial modelo largosta/resolucion2.jpg': {
    name: 'Resolución Recuperatorio 2° Parcial (Prof. Largosta) - Ej. 3 a 5 Tema 1.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/2do parcial modelo largosta/resolucion3.jpg': {
    name: 'Resolución Recuperatorio 2° Parcial (Prof. Largosta) - Ej. 1 a 3 Tema 2.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Calculo/Modelos Parciales/Segundo Parcial/2do parcial modelo largosta/resolucion4.jpg': {
    name: 'Resolución Recuperatorio 2° Parcial (Prof. Largosta) - Ej. 4 y 5 Tema 2.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },

  // === Ingenieria de Software 1 ===
  'Materias/Ingenieria de Software 1/Parciales/temp6410642487504952427.pdf': {
    name: 'Cuestionario Tema I - Sistemas de Información (10-04-2025).pdf',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2023 parciales/IMG-20250410-WA0006.jpg': {
    name: '2° Parcial Ingeniería de Software I (2023) - Caso Mercado Libres.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2024/2024 parciales/Imagen de WhatsApp 2025-04-10 a las 13.47.47_595e727b.jpg': {
    name: '2° Parcial Ingeniería de Software I (2024) - Sistema Gestión de Trámites (SGT).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2024/2024 parciales/Imagen de WhatsApp 2025-04-10 a las 13.47.47_f560b346.jpg': {
    name: 'Recuperatorio 2° Parcial IS1 (2024) - Tema 1 (Cultivos Inteligentes - Copia 1).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2024/2024 rec seg parcial/Imagen de WhatsApp 2025-06-12 a las 16.06.43_d02c8882.jpg': {
    name: 'Recuperatorio 2° Parcial IS1 (2024) - Tema 1 (Cultivos Inteligentes - Copia 2).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2024/2024 rec seg parcial/Imagen de WhatsApp 2025-06-12 a las 16.06.47_ffb03435.jpg': {
    name: 'Resolución Recuperatorio 2° Parcial IS1 (2024) - Diagrama de Clases Cultivos (Pizarrón).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2024/2024 rec seg parcial/Imagen de WhatsApp 2025-06-12 a las 16.06.52_92f2366b.jpg': {
    name: 'Resolución Recuperatorio 2° Parcial IS1 (2024) - Diagrama de Secuencia Cultivos (Pizarrón).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/IMG_1419.png': {
    name: '1° Parcial Práctico Ingeniería de Software I (2025) - Tema 2 (COCOMO II, Req. y Riesgos).png',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/2025 1er parcial/Imagen de WhatsApp 2025-06-25 a las 18.48.35_8eb80dcc.jpg': {
    name: '1° Parcial IS1 (29-04-2025) - Tema 1 (PERT, Riesgos, XP y Escenarios).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/2025 1er parcial/Imagen de WhatsApp 2025-06-25 a las 18.48.35_c23e0e83.jpg': {
    name: '1° Parcial IS1 (2025) - Tema 2 (COCOMO II, Entrevista y Scrum).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/PHOTO-2025-06-24-13-06-45.jpg': {
    name: '2° Parcial IS1 (2025) - Sistema Gestión de Trámites SGT (Copia).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/PHOTO-2025-06-24-15-15-02.jpg': {
    name: '2° Parcial IS1 (2025) - Tema 2 (Liquidación de Sellos y QR).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/PHOTO-2025-06-24-19-49-10.jpg': {
    name: 'Recuperatorio 2° Parcial IS1 (2025) - Tema 2 (Trámites a Distancia TAD).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/PHOTO-2025-06-24-20-45-02.jpg': {
    name: 'Recuperatorio 2° Parcial IS1 (2025) - Tema 1 (Eventos Culturales Municipalidad).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/PHOTO-2025-06-25-12-11-11.jpg': {
    name: '2° Parcial IS1 (2025) - Tema 3 (Talleres Extracurriculares y Contrato).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/PHOTO-2025-06-25-12-11-12.jpg': {
    name: '2° Parcial IS1 (2025) - Tema 4 (Talleres Extracurriculares y Casos de Uso).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/PHOTO-2025-06-25-12-11-12(1).jpg': {
    name: '2° Parcial IS1 (2025) - Liquidación de Sellos (Conversación y DER).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/PHOTO-2025-06-25-18-48-35.jpg': {
    name: '1° Parcial IS1 (29-04-2025) - Tema 1 (Copia).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/repaso 2do parcial/1.jpg': {
    name: 'Repaso 2° Parcial IS1 - DER Reserva de Aulas (Pizarrón).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/repaso 2do parcial/2.jpg': {
    name: 'Repaso 2° Parcial IS1 - Caso de Uso Asignar Aula (Pizarrón).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/repaso 2do parcial/2 otro.jpg': {
    name: 'Repaso 2° Parcial IS1 - Caso de Uso Asignación de Aula (Versión Alternativa).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Parciales/2025/repaso 2do parcial/3.jpg': {
    name: 'Repaso 2° Parcial IS1 - Diagrama de Secuencia Sistema Aula (Pizarrón).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 1/Practica/tp4/2.jpg': {
    name: 'TP 4 Ej. 2 - Diagrama de Casos de Uso Evaluación.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp4/3.jpg': {
    name: 'TP 4 Ej. 3 - Diagrama de Secuencia Catálogo y Pagos.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp4/10.jpg': {
    name: 'TP 4 Ej. 10 - Diagrama de Estados Cajero Automático.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp4/contrato.jpg': {
    name: 'TP 4 - Contratos Verificar Tarjeta y Actualizar Saldo.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp2 resuelto/47de6ecb-41b9-45a4-927f-1372a19364b8.jpg': {
    name: 'TP 2 Ej. 1 Resuelto - Historia de Usuario Carrito de Compras.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp2 resuelto/657b507e-9086-4dd4-b900-71048230d759.jpg': {
    name: 'TP 2 Ej. 7 Resuelto - Entrevista Sistema Documentos Digitales.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp2 resuelto/8d01bdf2-1bb7-404a-afeb-bf9d38614201.jpg': {
    name: 'TP 2 Ej. 3 Resuelto - Épicas e Historias de Usuario Moodle UNNE.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp2 resuelto/96387054-4662-4ba5-97f8-72e3ebfb97cd.jpg': {
    name: 'TP 2 Ej. 9 Resuelto - Escenarios Atención Médica Clínica.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp2 resuelto/cbd0289d-2633-4fa9-8571-8a9e6f97c6d7.jpg': {
    name: 'TP 2 Ej. 8 Resuelto - Escenario Registro de Nuevo Paciente.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp2 resuelto/d8740e80-f47e-4af7-bbd4-0755d331c1e8.jpg': {
    name: 'TP 2 Ej. 2 Resuelto - Historia de Usuario Carga de Producto.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 1/Practica/tp2 resuelto/ff8ca8ee-b266-4838-8e7f-679e011f9b56.jpg': {
    name: 'TP 2 Ej. 3 Resuelto (Pág. 2) - Historias de Usuario Moodle.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },

  // === Ingenieria de Software 2 ===
  'Materias/Ingenieria de Software 2/Años anteriores/Integrador/ISII_25TC_Grupo19/DER.png': {
    name: 'DER Integrador Grupo 19 - Sistema de Pedidos y Mesas.png',
    category: 'Proyectos',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 2/Investigaciones Individuales/Presentacion.png': {
    name: 'Consigna de Exposición - Investigación Individual IS2.png',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 2/Trabajo de Campo/Material PFC TFA/soft 06382658.pdf': {
    name: 'Paper IEEE - Design of Contract Management System Based on J2EE Architecture.pdf',
    category: 'Proyectos',
    parcialInstance: null,
  },
  'Materias/Ingenieria de Software 2/Parciales/2024/Primer Parcial/10bbe520-0be2-46a0-8043-12afe7b19b2a.jfif': {
    name: '2° Parcial Práctico IS2 (2024) - Tema 2 Pág 1 (Seguimientos - Copia).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2024/Primer Parcial/630c222b-f3f2-46d7-b667-20624320621c.jfif': {
    name: '1° Parcial Práctico y Teórico IS2 (2024) - Filatelia El Rincón del Coleccionista.jfif',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2024/Primer Parcial/7a63d08a-a77e-4f85-8095-c8ad36959391.jfif': {
    name: '1° Parcial Práctico y Teórico IS2 (2024) - Tema 2 (Tienda de Ropas).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2024/Primer Parcial/87798c9f-b2fe-45d9-a654-59edd028567d.jfif': {
    name: '1° Parcial Práctico y Teórico IS2 (2024) - Monitoreo Ambiental.jfif',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2024/Primer Parcial/9fa80545-c9a7-4c1c-a004-1f23676f1626.jfif': {
    name: '2° Parcial Práctico IS2 (2024) - Pág 2 (Smart Home - Copia).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2024/Segundo Parcial/10bbe520-0be2-46a0-8043-12afe7b19b2a.jfif': {
    name: '2° Parcial Práctico IS2 (2024) - Tema 2 Pág 1 (Seguimientos).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2024/Segundo Parcial/8be3bfa7-1aaf-4dfc-9446-878a27c61d31.jfif': {
    name: '2° Parcial Práctico IS2 (2024) - Pág 2 (Smart Home y Consignas).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2024/Segundo Parcial/9fa80545-c9a7-4c1c-a004-1f23676f1626.jfif': {
    name: '2° Parcial Práctico IS2 (2024) - Pág 2 (Smart Home y Consignas - Duplicado).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2024/Segundo Parcial/a4b596ff-2f9a-4a35-b587-9dee0d66f791.jfif': {
    name: '2° Parcial Práctico IS2 (2024) - Tema 1 Pág 1 (Seguimientos).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/0d65f739-5719-413c-899a-6d56b6a2b21d.jfif': {
    name: '1° Parcial Práctico y Teórico IS2 (2025) - Tema 2 Pág 1 (Distribución de Paquetes).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/19ee6f1a-77be-42e4-9fea-65f52a6ec287.jfif': {
    name: 'Recuperatorio 1° Parcial Teórico IS2 (2025) - Preguntas 2 a 6.jfif',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/3814e5b8-8677-45ff-affc-52f384b18df7.jfif': {
    name: '1° Parcial Teórico IS2 (2025) - Tema 2 Preguntas 2 a 6 (Copia 1).jfif',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/74c7ba02-3efd-470b-8d1c-d20a586a74d6.jfif': {
    name: 'Recuperatorio 1° Parcial Práctico y Teórico IS2 (2025) - Reclamos Municipalidad.jfif',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/8d5eaf1b-8e83-403d-8705-301e9e2d839e.jfif': {
    name: '1° Parcial Teórico IS2 (2025) - Tema 2 Preguntas 2 a 6 (Copia 2).jfif',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/8e3fd6b6-72e3-4711-af24-4e79ba753e34.jfif': {
    name: '1° Parcial Teórico IS2 (2025) - Tema 1 Preguntas 2 a 6 (Copia 1).jfif',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/9775bc85-0025-4f75-81eb-1ac8010680ad.jfif': {
    name: '1° Parcial Práctico y Teórico IS2 (2025) - Tema 1 Pág 1 (Obra Social - Copia 1).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/9e75a1dd-3fd8-4295-b4d4-8681afa795db.jfif': {
    name: '1° Parcial Práctico y Teórico IS2 (2025) - Tema 1 Pág 1 (Obra Social - Copia 2).jfif',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/ad4f3cc5-0627-4ee6-a65e-001d135a1637.jfif': {
    name: '1° Parcial Teórico IS2 (2025) - Tema 1 Preguntas 2 a 6 (Copia 2).jfif',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Primer Parcial/e451cf8f-b620-4d8b-a9cd-afc0c06d6245.jfif': {
    name: '1° Parcial Teórico IS2 (2025) - Tema 1 Preguntas 2 a 6 (Copia 3).jfif',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Segundo Parcial/PHOTO-2026-05-30-15-55-46.jpg': {
    name: '1° Parcial Teórico IS2 - Preguntas 5 y 6 (Pruebas e Inspecciones).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Segundo Parcial/PHOTO-2026-05-30-15-56-32.jpg': {
    name: '1° Parcial Teórico IS2 - Preguntas 2 a 4 (Reingeniería e Inspecciones).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Segundo Parcial/recuperatorio.PNG': {
    name: 'Recuperatorio 2° Parcial Práctico IS2 - Venta de Entradas y Patrones.png',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Segundo Parcial/recuperatorio_teoria.jfif': {
    name: 'Recuperatorio 2° Parcial Teórico IS2 - UML, Revisión y Patrones.jfif',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Segundo Parcial/Solucion de un tipo que hizo todo bien la practica/154bc758-4929-42eb-a2a4-47dd4ba645be.jfif': {
    name: 'Solución 2° Parcial IS2 - Casos de Prueba Sistema Estacionamiento.jfif',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Segundo Parcial/Solucion de un tipo que hizo todo bien la practica/3daa0ce1-39b2-40d9-8840-82618d1f14b7.jfif': {
    name: 'Solución 2° Parcial IS2 - Diagrama de Secuencia Sistema Estacionamiento.jfif',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Parciales/2025/Segundo Parcial/Solucion de un tipo que hizo todo bien la practica/4fcf821d-782c-496d-b62c-2e6e05cebc03.jfif': {
    name: 'Solución 2° Parcial IS2 - Diagrama de Clases Sistema Estacionamiento.jfif',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Ingenieria de Software 2/Teoria/Tema 4/00004067_ModeladoAmenazas.pdf': {
    name: 'Tema 4 - Modelado de Amenazas.pdf',
  },

  // === Logica y Matematica Computacional ===
  'Materias/Logica y Matematica Computacional/apuntes/programa.png': {
    name: 'Programa Analítico - Lógica y Matemática Computacional.png',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },

  // === Paradigmas y Lenguajes ===
  'Materias/Paradigmas y Lenguajes/data/678b8343-1c09-4802-96bf-8aec589cd623.jpg': {
    name: '2° Parcial Práctico Programación Funcional (08-06-2024) - Tema 2 (Cajas Camión LISP).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Paradigmas y Lenguajes/Material 2023/parciales/2do parcial/2a5777c6-fbed-4d88-82e3-a575d87ece8c.jpg': {
    name: '2° Parcial Práctico Paradigmas - Ej. 2 Programación Funcional (Rating TV LISP).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Paradigmas y Lenguajes/Material 2023/parciales/2do parcial/3aabcd20-f0e2-4f07-8211-7c76303e905b.jpg': {
    name: '2° Parcial Teórico Paradigmas (10-06-2023) - Tema 2 (Concurrencia y Flynn).jpg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Paradigmas y Lenguajes/Material 2023/Trabajos Practicos/Tp6/google.png': {
    name: 'Logo Google - TP 6.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.1.lsp': {
    name: 'TP 3 Ej. 3.1 - Conversión Pesos a Dólares.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.2 (palindromo)': {
    name: 'TP 3 Ej. 3.2 - Verificador de Palíndromo (Sin Extensión).lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.2.lsp': {
    name: 'TP 3 Ej. 3.2 - Verificador de Palíndromo.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.3.lsp': {
    name: 'TP 3 Ej. 3.3 - Clasificación de Clima por Temperatura.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.3.txt': {
    name: 'TP 3 Ej. 3.3 - Clasificación de Clima (Función Pura).txt',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.4.lsp': {
    name: 'TP 3 Ej. 3.4 - Insertar Átomo en Segunda Posición.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.4.txt': {
    name: 'TP 3 Ej. 3.4 - Insertar Átomo en Lista (Versión TXT).txt',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.5.lsp': {
    name: 'TP 3 Ej. 3.5 - Clasificación de Triángulos.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.5.txt': {
    name: 'TP 3 Ej. 3.5 - Clasificación de Triángulos (Versión TXT).txt',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.6.lsp': {
    name: 'TP 3 Ej. 3.6 - Mediano de Tres Números.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.6 con comentarios.lsp': {
    name: 'TP 3 Ej. 3.6 - Mediano de Tres Números (Comentado).lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.7.lsp': {
    name: 'TP 3 Ej. 3.7 - Buscar Temperatura en Listas Enero y Febrero.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.7 con comentarios.lsp': {
    name: 'TP 3 Ej. 3.7 - Buscar Temperatura Enero-Febrero (Comentado).lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.8.lisp': {
    name: 'TP 3 Ej. 3.8 - Primera y Última Temperatura del Mes.lisp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.8 con comentarios.lsp': {
    name: 'TP 3 Ej. 3.8 - Temperatura Primer Día del Mes (Comentado).lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.9.lsp': {
    name: 'TP 3 Ej. 3.9 - Evaluar Temperatura entre 40 y 45 Grados.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.9 con comentarios.lsp': {
    name: 'TP 3 Ej. 3.9 - Temperatura entre 40 y 45 Grados (Comentado).lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.10.lsp': {
    name: 'TP 3 Ej. 3.10 - Cantidad y Libreta de Alumnos en Lista.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.10 con comentarios.lsp': {
    name: 'TP 3 Ej. 3.10 - Cantidad de Alumnos (Comentado).lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.11.lsp': {
    name: 'TP 3 Ej. 3.11 - Rotación de Lista Izquierda y Derecha.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.12.lsp': {
    name: 'TP 3 Ej. 3.12 - Posición de un Elemento en Lista.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.13.lsp': {
    name: 'TP 3 Ej. 3.13 - Niveles y Dispersión del Río.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.14.lsp': {
    name: 'TP 3 Ej. 3.14 - Altura Útil del Pino.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.15.lsp': {
    name: 'TP 3 Ej. 3.15 - Costo de Pizza por Persona.lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/3.15 con comentarios.lsp': {
    name: 'TP 3 Ej. 3.15 - Costo de Pizza por Persona (Comentado).lsp',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Paradigmas y Lenguajes/practica/ejercicios del practico/todos los ejercicios del practico.docx': {
    name: 'Guía TP 3 Resuelta (Ejercicios 3.1 a 3.15).docx',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },

  // === Probabilidad y Estadistica ===
  'Materias/Probabilidad y Estadistica/Finales/Regular Resueltos/CamScanner 24-07-2024 09.27.pdf': {
    name: 'Examen Final Probabilidad Resuelto (24-07-2024).pdf',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Libres/Imagen de WhatsApp 2024-03-12 a las 17.40.33_adbea7db.jpg': {
    name: 'Examen Libre Probabilidad - Ej. 5 Intervalo de Confianza e Hipótesis (Diferencia de Medias).jpg',
    category: 'Exámenes Libres',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Libres/Imagen de WhatsApp 2024-03-12 a las 17.40.34_a0df10fe.jpg': {
    name: 'Examen Libre Probabilidad - Ej. 1 a 4 (Descriptiva, Red, Densidad y Exponencial).jpg',
    category: 'Exámenes Libres',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Libres/Imagen de WhatsApp 2024-03-13 a las 14.59.26_c5bbeccb.jpg': {
    name: 'Examen Libre Probabilidad - Ej. 5 Intervalo de Confianza Exponencial (Impreso).jpg',
    category: 'Exámenes Libres',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Libres/Imagen de WhatsApp 2024-03-13 a las 15.03.49_df4ed53c.jpg': {
    name: 'Examen Libre Probabilidad - Resolución Ej. 4 Distribución Exponencial.jpg',
    category: 'Exámenes Libres',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Libres/Imagen de WhatsApp 2024-03-13 a las 15.09.34_249a4585.jpg': {
    name: 'Apunte Teórico - Relación Modelo Exponencial y Poisson.jpg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Regular/14-09-23.jpeg': {
    name: 'Examen Final Probabilidad (14-09-2023) - FaCENA UNNE.jpeg',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Regular/imagen.pdf': {
    name: 'Examen Final Regular Probabilidad - Descriptiva, Hipergeométrica, Prob. Total, Normal y Poisson.pdf',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Regular Resueltos/imagen-2024-03-03-0320.excalidraw': {
    name: 'Resolución Examen Final Regular Probabilidad (Excalidraw).excalidraw',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Regular Resueltos/imagen-2024-03-03-0320.svg': {
    name: 'Resolución Examen Final Regular Probabilidad (Diagrama).svg',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Finales/Regular/2023/WhatsApp Image 2023-10-19 at 09.00.16.jpeg': {
    name: 'Examen Final Probabilidad (03-08-2023) - Estadística Descriptiva a Hipótesis.jpeg',
    category: 'Finales',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2008(Resuelto)/WhatsApp Image 2020-09-29 at 22.32.18 (6).jpeg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (17-10-2008) - Tema 2 Resuelto.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2008(Resuelto)/WhatsApp Image 2020-09-29 at 22.32.18 (9).jpeg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (17-10-2008) - Tema 2 Enunciado.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2013(Resueltos)/1234600_713977891950063_1274486149_n.jpg': {
    name: '1° Parcial Probabilidad (28-09-2013) - Tema 2 Resuelto.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2013(Resueltos)/1374942_713977915283394_1469385868_n.jpg': {
    name: '1° Parcial Probabilidad (28-09-2013) - Tema 2 Enunciado.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2013(Resueltos)/1382180_713977941950058_1031842621_n.jpg': {
    name: '1° Parcial Probabilidad (28-09-2013) - Tema 1 Enunciado.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2013(Resueltos)/1384040_713977861950066_1400484226_n.jpg': {
    name: '1° Parcial Probabilidad (28-09-2013) - Tema 1 Resuelto.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/PHOTO-2025-09-26-18-55-14.jpg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (26-09-2025) - LSI Tema 1.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/PHOTO-2025-09-26-21-15-36.jpg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (26-09-2025) - LSI Tema 2.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2021/Tema1/WhatsApp Image 2021-11-17 at 18.45.53.jpeg': {
    name: '1° Parcial Probabilidad (2021) - Ej. 2b a 4 (Copia 1).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2021/Tema1/WhatsApp Image 2021-11-17 at 18.45.53 (1).jpeg': {
    name: '1° Parcial Probabilidad (2021) - Ej. 1 y 2a (Tasa de Rendimiento).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2021/Tema1/WhatsApp Image 2021-11-17 at 18.45.53 (2).jpeg': {
    name: '1° Parcial Probabilidad (2021) - Ej. 2 a 4 (Copia 2).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2021/Tema1/WhatsApp Image 2021-11-17 at 18.45.53 (3).jpeg': {
    name: '1° Parcial Probabilidad (28-09-2021) - Ej. 1 Tasa de Rendimiento.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2021/Tema1/WhatsApp Image 2021-11-17 at 18.45.53 (4).jpeg': {
    name: '1° Parcial Probabilidad (28-09-2021) - Ej. 4 Densidad Conjunta.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.30.52.jpeg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (30-09-2016) - Tema 1 (Salarios y Densidad).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.30.52 (1).jpeg': {
    name: '1° Parcial Probabilidad (16-09-2016) - Tema 1 (Virus, Bayes y Duración).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.30.52 (2).jpeg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (30-09-2016) - Tema 2 (Hogares y Cartas - Copia 1).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.30.52 (3).jpeg': {
    name: '1° Parcial Probabilidad (16-09-2016) - Tema 2 (Sigma-álgebra y Densidad Conjunta).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.30.52 (4).jpeg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (30-09-2016) - Tema 2 (Hogares y Cartas - Copia 2).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18.jpeg': {
    name: 'Apunte Teórico 2017 - Teorema de Bayes, Variables Aleatorias y Esperanza.jpeg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (1).jpeg': {
    name: 'Apunte Teórico 2017 - Axiomas de Probabilidad, Condicional e Independencia.jpeg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (2).jpeg': {
    name: 'Plantilla de Fórmulas 1° Parcial - Estadística Descriptiva (2017).jpeg',
    category: 'Teoría y Apuntes',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (5).jpeg': {
    name: 'Resolución 1° Parcial Probabilidad - Ej. 1 Histograma y Ej. 2 Bayes.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (8).jpeg': {
    name: 'Resolución 1° Parcial Probabilidad - Ej. 3 Distribución Acumulada F(x).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (19).jpeg': {
    name: 'Resolución 1° Parcial Probabilidad - Ej. 3 Alumnos Resistencia (Binomial).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (21).jpeg': {
    name: 'Resolución 1° Parcial Probabilidad - Tema 1 Ej. 1 Estatura Recién Nacidos.jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (22).jpeg': {
    name: 'Ejercicio 8 Resuelto - Lectores de Periódicos A, B y C (Probabilidad Condicional).jpeg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (23).jpeg': {
    name: '1° Parcial Probabilidad - Ej. 4 Llegada de Ana y Blanca (Pág. 2).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (26).jpeg': {
    name: '1° Parcial Probabilidad - Ej. 1 a 4 Estatura Tornillos y Llegada Ana y Blanca (Pág. 1).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (35).jpeg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (30-09-2016) - Tema 1 (Salarios y Densidad - Copia).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (36).jpeg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (30-09-2016) - Tema 2 (Hogares y Cartas - Copia 3).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (37).jpeg': {
    name: '1° Parcial Probabilidad (16-09-2016) - Tema 1 (Virus, Bayes y Duración - Copia).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (38).jpeg': {
    name: 'Recuperatorio 1° Parcial Probabilidad (30-09-2016) - Tema 2 (Hogares y Cartas - Copia 4).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Primer Parcial/2016/WhatsApp Image 2020-09-29 at 22.32.18 (39).jpeg': {
    name: '1° Parcial Probabilidad (16-09-2016) - Tema 2 (Sigma-álgebra y Densidad Conjunta - Copia).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Segundo Parcial/PHOTO-2025-10-14-14-09-17.jpg': {
    name: 'Recuperatorio 2° Parcial Probabilidad (11-11-2016) - Tema 1 (Control de Calidad y Llantas).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Segundo Parcial/PHOTO-2025-10-14-14-09-17(1).jpg': {
    name: '2° Parcial Probabilidad (04-11-2016) - Tema 1 (Poisson, Tornillos y Proporción).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Segundo Parcial/PHOTO-2025-10-14-14-09-17(2).jpg': {
    name: '2° Parcial Probabilidad (06-11-2015) - Tema 1 (Costos, Llamadas, Calculadoras y Netbooks).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Segundo Parcial/PHOTO-2025-10-14-14-09-17(3).jpg': {
    name: '2° Parcial Probabilidad (10-11-2017) - Tema 2 (Lote, Motor Avión y Chip 8 bits).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Segundo Parcial/PHOTO-2025-10-14-14-09-17(4).jpg': {
    name: '2° Parcial Probabilidad (06-11-2015) - Tema 2 (Azucarera, Láser, Focos y Sondeo).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Segundo Parcial/PHOTO-2025-10-14-14-09-17(5).jpg': {
    name: '2° Parcial Probabilidad (04-11-2016) - Tema 2 (Conmutador, Overbooking y Componentes).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Segundo Parcial/PHOTO-2025-10-14-14-09-17(6).jpg': {
    name: 'Recuperatorio 2° Parcial Probabilidad (11-11-2016) - Tema 2 (Lámparas y Hogares Internet).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Segundo Parcial/PHOTO-2025-10-14-14-09-17(7).jpg': {
    name: '2° Parcial Probabilidad (10-11-2017) - Tema 1 (Erratas Libro, Tarjeta VISA y Red).jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Probabilidad y Estadistica/Modelos Parciales/Segundo Parcial/PHOTO-2025-10-14-14-09-17(8).jpg': {
    name: 'Recuperatorio 2° Parcial Probabilidad (18-11-2016) - Fallas Componentes, Móvil y Robótica.jpg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },

  // === Taller de Programacion 2 ===
  'Materias/Taller de Programacion 2/practicos/Practico5/Assets/images.jpg': {
    name: 'Asset Fondo Pizarra Gris Oscuro - TP 5.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Taller de Programacion 2/practicos/Practico5/Assets/cuadros_negros-734708.png': {
    name: 'Asset Patrón Cuadros Negros - TP 5.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Taller de Programacion 2/practicos/Practico5/Assets/avatar.jpg': {
    name: 'Asset Avatar Usuario - TP 5.jpg',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },
  'Materias/Taller de Programacion 2/practicos/Practico5/Assets/floppy.png': {
    name: 'Asset Ícono Guardar Disquete - TP 5.png',
    category: 'Práctica y TPs',
    parcialInstance: null,
  },

  // === Teoria de la Computacion ===
  'Materias/Teoria de la Computacion/modelos/WhatsApp Image 2023-06-07 at 18.46.43.jpeg': {
    name: '2° Parcial Práctico Teoría de la Computación (2018) - Tema 1 (APD y MT).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Teoria de la Computacion/modelos/WhatsApp Image 2023-06-07 at 18.46.44.jpeg': {
    name: '1° Parcial Práctico Teoría de la Computación (2017) - Tema 2 (Gramáticas y AEF).jpeg',
    category: 'Parcial Práctico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Teoria de la Computacion/modelos/WhatsApp Image 2023-06-07 at 18.46.44 (1).jpeg': {
    name: '2° Parcial Teórico Teoría de la Computación (18-06-2018) - APD y MT.jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
  'Materias/Teoria de la Computacion/modelos/WhatsApp Image 2023-06-07 at 18.46.44 (2).jpeg': {
    name: '1° Parcial Teórico Teoría de la Computación - Gramáticas y AEF (40%).jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '1° Parcial',
  },
  'Materias/Teoria de la Computacion/modelos/WhatsApp Image 2023-06-07 at 18.46.44 (3).jpeg': {
    name: '2° Parcial Teórico Teoría de la Computación (18-06-2018) - APD y MT (Copia).jpeg',
    category: 'Parcial Teórico',
    parcialInstance: '2° Parcial',
  },
};

const TEXT_OR_DOC_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.odt', '.ods',
  '.txt', '.md', '.jpg', '.jpeg', '.png', '.jfif', '.webp', '.gif', '.svg',
]);

function formatCalculoClassSlideName(normalizedRel, fileName, ext, slideCounters) {
  if (!/^Materias\/Calculo\/Apuntes y fotos\//i.test(normalizedRel)) {
    return null;
  }
  if (!/^(?:IMG[-_]|WhatsApp\s+Image)/i.test(fileName)) {
    return null;
  }
  const relDir = normalizedRel.split('/').slice(0, -1).join('/');
  const folderName = relDir.split('/').filter(Boolean).pop() || 'Apuntes de Clase';
  const nextIndex = (slideCounters.get(relDir) || 0) + 1;
  slideCounters.set(relDir, nextIndex);
  const padded = String(nextIndex).padStart(2, '0');
  const suffix = ext || path.extname(fileName);
  return `Diapositiva ${padded} - ${folderName}${suffix}`;
}

function cleanDisplayFilename(normalizedRel, folderPath, fileName, ext, slideCounters) {
  const slideName = formatCalculoClassSlideName(normalizedRel, fileName, ext, slideCounters);
  if (slideName) return slideName;

  const actualExt = ext || path.extname(fileName);
  let base = actualExt && fileName.toLowerCase().endsWith(actualExt.toLowerCase())
    ? fileName.slice(0, -actualExt.length)
    : fileName;

  // IS1 Practica tp1..tp4 short names (ejer1, ej2, 1a, etc.)
  const relDir = normalizedRel.split('/').slice(0, -1).join('/');
  const tpFolderMatch = normalizedRel.match(/^Materias\/Ingenieria de Software 1\/Practica\/tp(\d+)\//i);
  if (tpFolderMatch) {
    const ejMatch = base.match(/^(?:ej(?:er(?:cicio)?)?\.?\s*)?(\d+[a-z]?)$/i);
    if (ejMatch) {
      return `TP ${tpFolderMatch[1]} Ej. ${ejMatch[1]}${actualExt}`;
    }
  }

  // Paradigmas TP4 / TP5 / TP6 ejercicios
  if (/^Materias\/Paradigmas y Lenguajes\//i.test(normalizedRel)) {
    if (/tp4\s+recursividad/i.test(relDir)) {
      const m = base.match(/^ejercicio\s*(\d+.*)$/i);
      if (m) return `TP 4 Recursividad - Ejercicio ${m[1].trim()}${actualExt}`;
    }
    if (/(?:^|\/)TP5$/i.test(relDir)) {
      const m = base.match(/^ejercicio\s*(\d+.*)$/i);
      if (m) return `TP 5 Mapcar y Lambda - Ejercicio ${m[1].trim()}${actualExt}`;
    }
    if (/Trabajos Practicos\/Tp(\d+)$/i.test(relDir)) {
      const m = base.match(/^Tp(\d+)$/i);
      if (m) return `Enunciado TP ${m[1]}${actualExt}`;
    }
  }

  // Limpiar extensiones dobles con hash tipo .docx_d55001146354... (antes de limpiar hashes generales)
  base = base.replace(/\.docx_+[a-f0-9]{16,}(?:\s+(\d+))?$/i, (_, copyNum) =>
    copyNum ? ` (Copia ${copyNum})` : ''
  );

  // Limpiar hashes Moodle / exportación + timestamp opcional (ej. _7c31af..._250624_141117)
  base = base.replace(
    /_+[a-f0-9]{16,}(?:_\d{6}_\d{6})?(?:\s*\((\d+)\)|\s+(\d+))?$/i,
    (_, pCopy, sCopy) => {
      const copyNum = pCopy || sCopy;
      return copyNum ? ` (Copia ${copyNum})` : '';
    }
  );

  // Limpiar prefijos numéricos largos tipo 00004067_ o 1472224285
  base = base.replace(/^\d{6,}[_-]\s*/, '');

  // Para documentos e imágenes, convertir guiones bajos en espacios legibles
  if (TEXT_OR_DOC_EXTENSIONS.has((actualExt || '').toLowerCase())) {
    base = base.replace(/_+/g, ' ');
  }

  base = base.replace(/\s{2,}/g, ' ').trim();
  return `${base}${actualExt}`;
}

const JUNK_DIR_SEGMENTS = new Set([
  'dev c++',
  'bin',
  'obj',
  '.git',
  '.vs',
  'node_modules',
]);

function normalizeText(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function detectCategory(folderPath, fileName, ext, sizeBytes) {
  const folderNorm = normalizeText(folderPath);
  const fileNorm = normalizeText(fileName);
  const extLower = (ext || '').toLowerCase();

  // 1. Exámenes Libres
  if (
    /\blibre(s)?\b/.test(folderNorm) ||
    (/(\bexamen\s*libre\b|\bmesa.*libre\b|\bmodelo.*libre\b|\blibre(s)?\b)/.test(fileNorm) &&
      !/software\s*libre|licencia|libreoffice/.test(fileNorm))
  ) {
    return 'Exámenes Libres';
  }

  // 2. Finales
  if (
    /\bfinal(es)?\b/.test(folderNorm) ||
    (/(\bexamen\s*final\b|\bfinal\s+(regular|de|agosto|marzo|febrero|julio|diciembre|feb|abr|may|jun|sep|oct|nov)\b|\btemas\s*final\b|\bfinal\s*\d{4}\b|^final\b)/.test(
      fileNorm
    ) &&
      !/version\s*final|entrega\s*final|proyecto\s*final/.test(fileNorm))
  ) {
    return 'Finales';
  }

  // 3. Bibliografía y Libros
  if (
    /\b(libros|bibliografia)\b/.test(folderNorm) ||
    (!/\b(practica|resueltos|filminas|apuntes|tp|parcial|final)\b/.test(folderNorm) &&
      extLower === '.pdf' &&
      sizeBytes > 25 * 1024 * 1024 &&
      !/(parcial|final|\btp\s*\d|\btp\d|practico|apunte|resumen|guia)/.test(fileNorm))
  ) {
    return 'Bibliografía y Libros';
  }

  // 4. Proyectos / Integradores / Monografías / Laboratorios
  if (
    /\b(trabajo\s*integrador|integrador|proyecto(s)?|laboratorio(s)?|monografia(s)?|trabajo\s*de\s*campo)\b/.test(
      folderNorm
    ) ||
    /^(proyecto\s*\d|documentacion\s*proyecto|taller.*proyecto|trabajo\s*integrador|tp\s*integrador)/.test(
      fileNorm
    )
  ) {
    return 'Proyectos';
  }

  // 5. Parciales (Práctico / Teórico) — priorizar carpetas explícitas de parciales/modelos/evaluaciones
  const isParcialFolder =
    /\b(parcial|parciales|recuperatorio(s)?|autoevaluacion)\b/.test(folderNorm) ||
    /^modelos(\s|$)/.test(folderNorm) ||
    /\/\s*modelos(\s|$)/.test(folderNorm) ||
    /ej\s*parcial/.test(folderNorm);

  const isParcialFile =
    !/\btp\s*\d|\btp\d/.test(fileNorm) &&
    !/modelo(s)?\s*(de\s*sistema|probabilistic|acme|agil)/.test(fileNorm) &&
    /(\bparcial\b|\brecuperatorio\b|\bmodelo\s*(de\s*)?(examen|parcial)\b|\bautoevaluacion\b|\brevision\s*del\s*intento\b)/.test(
      fileNorm
    );

  if (isParcialFolder || isParcialFile) {
    // Resúmenes / repasos teóricos en carpetas de apuntes o clases van a Parcial Teórico si son cuestionarios/teoría
    if (
      /(teor|oral|preguntas|cuestionario|autoevaluacion|revision|resumen\s*parcial)/.test(
        `${folderNorm} ${fileNorm}`
      )
    ) {
      return 'Parcial Teórico';
    }
    return 'Parcial Práctico';
  }

  // Carpeta explícita de Teoría/Apuntes/Filminas/Demostraciones
  const isExplicitTheoryFolder =
    /^(teoria|apuntes|filminas|diapositivas|demostraciones|clases|info|investigaciones)/.test(
      folderNorm
    ) || /\/\s*(teoria|resumen teoria|presentaciones)$/.test(folderNorm);

  // 6. Práctica y Trabajos Prácticos
  const isPracticeFolder =
    /\b(practica(s)?|practico(s)?|trabajos(\s*practicos)?|ejercicios|actividades\s*practicas|cursograma|organigrama|estrategias|partes\s*de\s*un\s*programa|borradores)\b/.test(
      folderNorm
    );

  const isPracticeFile =
    !isExplicitTheoryFolder &&
    (['.c', '.cpp', '.lsp', '.lisp', '.cs', '.sql', '.s', '.h', '.xlsx', '.excalidraw'].includes(
      extLower
    ) ||
      /\b(tp\s*\d+|tp\d+|practico\s*n?|trabajo\s*practico|guia\s*practica|ejercicios|cuestionario\s*ejerc|cuestionario)\b/.test(
        fileNorm
      ));

  if (isPracticeFolder || isPracticeFile) {
    return 'Práctica y TPs';
  }

  // 7. Teoría y Apuntes (todo el material restante)
  return 'Teoría y Apuntes';
}

function detectParcialInstance(category, folderPath, fileName) {
  if (category !== 'Parcial Práctico' && category !== 'Parcial Teórico') {
    return undefined;
  }
  const fNorm = normalizeText(folderPath);
  const nNorm = normalizeText(fileName);
  const matchInstance = (text) => {
    if (/\b(recuperatorio|recup)\b/.test(text)) return 'Recuperatorio';
    if (/\b(1er|1ro|1°|primer|p1|parcial\s*1|parcial1)\b/.test(text)) return '1° Parcial';
    if (/\b(2do|2da|2°|segundo|p2|parcial\s*2|parcial2)\b/.test(text)) return '2° Parcial';
    if (/\b(3er|3ro|3°|tercer|p3|parcial\s*3|parcial3)\b/.test(text)) return '3° Parcial';
    return undefined;
  };
  return matchInstance(fNorm) || matchInstance(nNorm);
}

function cleanReadmeMarkdown(raw) {
  let text = raw
    // Remove centered HTML header blocks (<p align="center">...</p>, <div align="center">...</div>)
    .replace(/<div[^>]*align="center"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<p[^>]*align="center"[^>]*>[\s\S]*?<\/p>/gi, '')
    // Remove standalone img badges/tags
    .replace(/<img[^>]*>/gi, '')
    // Clean excess leading blank lines and dividers
    .replace(/^(\s*---\s*\n)+/gm, '\n---\n')
    .trim();

  if (text.length > 6000) {
    text = text.slice(0, 6000) + '\n\n...(Contenido truncado para vista rápida — abrí el README completo en el repositorio)';
  }
  return text || raw.trim();
}

function walkFiles(dirPath, onFile) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (JUNK_DIR_SEGMENTS.has(entry.name.toLowerCase())) continue;
      walkFiles(fullPath, onFile);
    } else if (entry.isFile()) {
      const lowerName = entry.name.toLowerCase();
      if (entry.name.startsWith('~$')) continue;
      if (JUNK_FILENAMES.has(lowerName)) continue;
      const ext = path.extname(lowerName);
      if (JUNK_EXTENSIONS.has(ext)) continue;
      onFile(fullPath, entry.name, ext);
    }
  }
}

const catalogItems = [];
const readmeNotes = [];
const slideCounters = new Map();

const materiasDir = path.join(SOURCE_ROOT, 'Materias');
const subjectFolders = fs
  .readdirSync(materiasDir, { withFileTypes: true })
  .filter((d) => d.isDirectory());

let fileCounter = 1;

for (const folder of subjectFolders) {
  const subjectId = SUBJECT_FOLDER_MAP[folder.name];
  if (!subjectId) {
    console.warn(`⚠ Carpeta sin mapeo en SUBJECT_FOLDER_MAP: ${folder.name}`);
    continue;
  }

  const subjectRoot = path.join(materiasDir, folder.name);
  walkFiles(subjectRoot, (fullPath, fileName, ext) => {
    const stat = fs.statSync(fullPath);
    const relFromRoot = path
      .relative(SOURCE_ROOT, fullPath)
      .split(path.sep)
      .join('/');
    const relInsideSubject = path
      .relative(subjectRoot, fullPath)
      .split(path.sep)
      .join('/');
    const folderParts = relInsideSubject.split('/');
    folderParts.pop(); // remove file name
    const folderPath = folderParts.length > 0 ? folderParts.join(' / ') : 'Raíz de la materia';
    const isTopLevelReadme = relInsideSubject.toLowerCase() === 'readme.md';

    const normalizedRel = relFromRoot.replace(/\\/g, '/');
    const override = MANUAL_FILE_OVERRIDES[normalizedRel];
    const displayName =
      override?.name ??
      cleanDisplayFilename(normalizedRel, folderPath, fileName, ext, slideCounters);
    const category = override?.category ?? detectCategory(folderPath, fileName, ext, stat.size);
    const isParcialCategory = category === 'Parcial Práctico' || category === 'Parcial Teórico';
    const parcialInstance =
      override && 'parcialInstance' in override
        ? override.parcialInstance
        : isParcialCategory
          ? detectParcialInstance(category, folderPath, fileName)
          : null;

    if (!isTopLevelReadme) {
      catalogItems.push({
        id: `unne-file-${fileCounter++}`,
        subjectId,
        subjectFolder: folder.name,
        name: displayName,
        ext: ext || '',
        sizeBytes: stat.size,
        category,
        ...(parcialInstance ? { parcialInstance } : {}),
        folderPath,
        relativePath: relFromRoot,
      });
    }

    // Convert top-level README.md of each subject into a rich verified StudyNote
    if (isTopLevelReadme) {
      const rawContent = fs.readFileSync(fullPath, 'utf8');
      const cleaned = cleanReadmeMarkdown(rawContent);
      const firstHeadingMatch = cleaned.match(/^#\s+(.+)$/m);
      const heading = firstHeadingMatch
        ? firstHeadingMatch[1].trim()
        : `Guía Completa de ${folder.name}`;

      readmeNotes.push({
        id: `unne-readme-${subjectId}`,
        title: heading,
        subjectId,
        category: 'Teoría y Apuntes',
        author: 'Repositorio UNNE-LSI (@tobiager)',
        createdAt: 'Base UNNE-LSI',
        votes: 95,
        verifiedByStudents: true,
        tags: ['UNNE-LSI', 'Guía Oficial', folder.name],
        summary: `Guía e índice de material recopilado para ${folder.name} dentro de UNNE-LSI (temario, estructura de carpetas y consejos de cursada).`,
        contentMarkdown: cleaned,
        externalFileUrl: relFromRoot,
      });
    }
  });
}

// Include Plan 2009 / 2023 docs from planes/
const planesDir = path.join(SOURCE_ROOT, 'planes');
walkFiles(planesDir, (fullPath, fileName, ext) => {
  const stat = fs.statSync(fullPath);
  const relFromRoot = path
    .relative(SOURCE_ROOT, fullPath)
    .split(path.sep)
    .join('/');
  catalogItems.push({
    id: `unne-plan-${fileCounter++}`,
    subjectId: 'planes-lsi',
    subjectFolder: 'Planes de Estudio (2009 y 2023)',
    name: fileName,
    ext: ext || '',
    sizeBytes: stat.size,
    category: 'Teoría y Apuntes',
    folderPath: 'Planes de Estudio UNNE',
    relativePath: relFromRoot,
  });
});

// Write generated JSON catalog
const catalogOutPath = path.join(WEB_ROOT, 'src', 'data', 'unneArchiveCatalog.json');
fs.writeFileSync(catalogOutPath, JSON.stringify(catalogItems, null, 2), 'utf8');

// Write generated README StudyNotes TS module
const readmeOutPath = path.join(WEB_ROOT, 'src', 'data', 'unneReadmeNotes.ts');
const tsContent = `// AUTO-GENERATED by scripts/generateUnneCatalog.mjs from C:\\Users\\cuent\\Documents\\UNNE\\UNNE-LSI-main
import type { StudyNote } from './mockDatabase';

export const UNNE_README_NOTES: StudyNote[] = ${JSON.stringify(readmeNotes, null, 2)};
`;
fs.writeFileSync(readmeOutPath, tsContent, 'utf8');

console.log(`✅ Generados ${catalogItems.length} archivos en ${catalogOutPath}`);
console.log(`✅ Generadas ${readmeNotes.length} guías README en ${readmeOutPath}`);
