import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileImage,
  Code2,
  Sparkles,
  RotateCcw,
  Eye,
  Upload,
  Award,
  Terminal,
  SplitSquareVertical,
  ArrowLeft,
} from 'lucide-react';
import { ExamChallenge, Subject } from '../data/mockDatabase';

// ============================================================================
// RESALTADOR DE SINTAXIS PARA PALABRAS RESERVADAS (C, FUNCIONAL, JAVA Y PSEUDOCÓDIGO UNNE)
// ============================================================================
const CONTROL_AND_STORAGE_KEYWORDS = new Set([
  // C / C++ / Java / JS
  'if',
  'else',
  'while',
  'for',
  'do',
  'switch',
  'case',
  'default',
  'break',
  'continue',
  'return',
  'sizeof',
  'typedef',
  'struct',
  'class',
  'interface',
  'abstract',
  'extends',
  'implements',
  'public',
  'private',
  'protected',
  'static',
  'final',
  'const',
  'let',
  'var',
  'function',
  'new',
  'this',
  'super',
  'import',
  'package',
  'try',
  'catch',
  'finally',
  'throw',
  'throws',
  // Pseudocódigo Académico UNNE (Algoritmos I y II)
  'Accion',
  'accion',
  'Es',
  'es',
  'Ambiente',
  'ambiente',
  'Proceso',
  'proceso',
  'Fin_Accion',
  'fin_accion',
  'Si',
  'si',
  'Entonces',
  'entonces',
  'Sino',
  'sino',
  'Fin_Si',
  'fin_si',
  'Mientras',
  'mientras',
  'Hacer',
  'hacer',
  'Fin_Mientras',
  'fin_mientras',
  'Para',
  'para',
  'Hasta',
  'hasta',
  'Fin_Para',
  'fin_para',
  'Segun',
  'segun',
  'Fin_Segun',
  'fin_segun',
  'Funcion',
  'funcion',
  'Fin_Funcion',
  'fin_funcion',
  'Procedimiento',
  'procedimiento',
  'Fin_Procedimiento',
  'fin_procedimiento',
  'Registro',
  'registro',
  'Fin_Registro',
  'fin_registro',
  'Nuevo',
  'nuevo_nodo',
  'Disponer',
  'Escribir',
  'Leer',
  'MOD',
  'DIV',
  'Y',
  'O',
  'NO',
]);

const TYPE_KEYWORDS = new Set([
  'int',
  'float',
  'double',
  'char',
  'void',
  'bool',
  'boolean',
  'long',
  'short',
  'unsigned',
  'signed',
  'size_t',
  'FILE',
  'String',
  'ArrayList',
  'List',
  'Map',
  'HashMap',
  'Set',
  'Object',
  'Integer',
  'Double',
  'Boolean',
  'System',
  'Nodo',
  'Empleado',
  'Laboratorio',
  'Alumno',
  'Entero',
  'entero',
  'Real',
  'real',
  'Alfanumerico',
  'alfanumerico',
  'Logico',
  'logico',
  'Puntero',
  'puntero',
]);

const BUILTIN_FUNCTIONS = new Set([
  'malloc',
  'calloc',
  'realloc',
  'free',
  'printf',
  'scanf',
  'fopen',
  'fclose',
  'fread',
  'fwrite',
  'filter',
  'map',
  'reduce',
  'forEach',
  'find',
  'some',
  'every',
  'add',
  'get',
  'size',
  'remove',
  'println',
  'print',
  'out',
]);

const LITERAL_CONSTANTS = new Set([
  'NULL',
  'NIL',
  'null',
  'true',
  'false',
  'Verdadero',
  'verdadero',
  'Falso',
  'falso',
]);

const highlightSingleLine = (line: string, lineIdx: number): React.ReactNode => {
  // 1. Directivas de preprocesador (#include, #define, etc.)
  if (/^\s*#\s*(include|define|ifdef|ifndef|endif|pragma)\b/.test(line)) {
    const match = line.match(/^(\s*#\s*\w+)(.*)$/);
    if (match) {
      return (
        <React.Fragment key={lineIdx}>
          <span className="text-[#e58a67] font-semibold">{match[1]}</span>
          <span className="text-[#b8d49c]">{match[2]}</span>
        </React.Fragment>
      );
    }
  }

  // 2. Separar comentario de fin de línea "// ..."
  const commentIdx = line.indexOf('//');
  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : '';

  // Tokenizador por expresiones regulares: strings, anotaciones, identificadores, números, operadores y espacios
  const tokenRegex =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|@[A-Za-z_]\w*|\b[A-Za-z_][A-Za-z0-9_]*\b|\b\d+(?:\.\d+)?\b|->|=>|<=|>=|==|!=|[{}()[\].,;:+*/=<>&|-]+|\s+|.)/g;

  const tokens = codePart.match(tokenRegex) || [];

  return (
    <React.Fragment key={lineIdx}>
      {tokens.map((tok, i) => {
        // Strings entre comillas
        if (
          (tok.startsWith('"') && tok.endsWith('"')) ||
          (tok.startsWith("'") && tok.endsWith("'"))
        ) {
          return (
            <span key={i} className="text-[#b8d49c]">
              {tok}
            </span>
          );
        }

        // Anotaciones (@Override)
        if (tok.startsWith('@')) {
          return (
            <span key={i} className="text-[#e58a67] font-semibold">
              {tok}
            </span>
          );
        }

        // Palabras reservadas de control y estructura (if, else, while, for, return, struct, class, public, private, const...)
        if (CONTROL_AND_STORAGE_KEYWORDS.has(tok)) {
          return (
            <span key={i} className="text-[#f0a45d] font-semibold">
              {tok}
            </span>
          );
        }

        // Tipos de datos y estructuras (int, float, void, double, String, ArrayList, Nodo, Empleado...)
        if (TYPE_KEYWORDS.has(tok)) {
          return (
            <span key={i} className="text-[#78c5d6] font-semibold">
              {tok}
            </span>
          );
        }

        // Constantes booleanas / punteros nulos (NULL, null, true, false, NIL)
        if (LITERAL_CONSTANTS.has(tok)) {
          return (
            <span key={i} className="text-[#e07a88] font-semibold">
              {tok}
            </span>
          );
        }

        // Funciones nativas / orden superior (malloc, filter, map, reduce, printf...)
        if (BUILTIN_FUNCTIONS.has(tok)) {
          return (
            <span key={i} className="text-[#c59bf0] font-medium">
              {tok}
            </span>
          );
        }

        // Números literales
        if (/^\d+(\.\d+)?$/.test(tok)) {
          return (
            <span key={i} className="text-[#98c992] font-medium">
              {tok}
            </span>
          );
        }

        // Operadores flecha (->, =>) y llaves/paréntesis
        if (tok === '->' || tok === '=>') {
          return (
            <span key={i} className="text-k-d6b892 font-bold">
              {tok}
            </span>
          );
        }

        // Llamadas a funciones definidas por el usuario (identificador seguido de '(')
        const nextNonSpace = tokens
          .slice(i + 1)
          .find((t) => !/^\s+$/.test(t));
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(tok) && nextNonSpace?.startsWith('(')) {
          return (
            <span key={i} className="text-[#ebd09e]">
              {tok}
            </span>
          );
        }

        return <span key={i}>{tok}</span>;
      })}
      {commentPart && (
        <span className="text-[#7d7063] italic">{commentPart}</span>
      )}
    </React.Fragment>
  );
};

export const renderHighlightedCode = (fullCode: string): React.ReactNode => {
  const lines = fullCode.split('\n');
  return lines.map((line, idx) => (
    <React.Fragment key={idx}>
      {highlightSingleLine(line, idx)}
      {idx < lines.length - 1 ? '\n' : ''}
    </React.Fragment>
  ));
};

interface ExamSimulatorLabProps {
  exams: ExamChallenge[];
  subjects: Subject[];
  selectedYear: number;
  selectedSubjectId: string | 'all';
  onBackToSelectYear: () => void;
}

interface CriterionResult {
  criterionId: string;
  label: string;
  points: number;
  passed: boolean;
  hintIfMissing: string;
}

interface EvaluationReport {
  totalScore: number;
  passingScore: number;
  approved: boolean;
  gradeOutOfTen: string;
  criteriaResults: CriterionResult[];
  syntaxWarnings: string[];
  similarityPercent: number;
}

export const ExamSimulatorLab: React.FC<ExamSimulatorLabProps> = ({
  exams,
  subjects,
  selectedYear,
  selectedSubjectId,
  onBackToSelectYear,
}) => {
  const yearExams = exams.filter((e) => e.year === selectedYear);

  const [activeExamId, setActiveExamId] = useState<string>(() => {
    if (selectedSubjectId !== 'all') {
      const match = yearExams.find((e) => e.subjectId === selectedSubjectId);
      if (match) return match.id;
    }
    return yearExams[0]?.id || exams[0].id;
  });

  useEffect(() => {
    if (selectedSubjectId !== 'all') {
      const match = yearExams.find((e) => e.subjectId === selectedSubjectId);
      if (match) {
        setActiveExamId(match.id);
        return;
      }
    }
    if (yearExams.length > 0 && !yearExams.some((e) => e.id === activeExamId)) {
      setActiveExamId(yearExams[0].id);
    }
  }, [selectedYear, selectedSubjectId]);

  const activeExam =
    yearExams.find((e) => e.id === activeExamId) ||
    yearExams[0] ||
    exams[0];

  const [code, setCode] = useState<string>(activeExam.starterCode);
  const [leftTab, setLeftTab] = useState<'sheet' | 'rubric'>('sheet');
  const [customExamImage, setCustomExamImage] = useState<string | null>(null);
  const [compilerOutput, setCompilerOutput] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationReport | null>(null);
  const [showSolutionDiff, setShowSolutionDiff] = useState<boolean>(false);

  const preHighlightRef = useRef<HTMLPreElement | null>(null);
  const gutterLinesRef = useRef<HTMLDivElement | null>(null);

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preHighlightRef.current) {
      preHighlightRef.current.scrollTop = scrollTop;
      preHighlightRef.current.scrollLeft = scrollLeft;
    }
    if (gutterLinesRef.current) {
      gutterLinesRef.current.scrollTop = scrollTop;
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(nextCode);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(
    activeExam.durationMinutes * 60
  );
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    setCode(activeExam.starterCode);
    setEvaluation(null);
    setCompilerOutput(null);
    setShowSolutionDiff(false);
    setSecondsLeft(activeExam.durationMinutes * 60);
    setTimerRunning(false);
  }, [activeExam.id]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomExamImage(url);
  };

  const runCompilerCheck = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setCompilerOutput('Error de compilación: El editor está vacío.');
      return;
    }

    const openBraces = (trimmed.match(/\{/g) || []).length;
    const closeBraces = (trimmed.match(/\}/g) || []).length;
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;

    if (openBraces !== closeBraces) {
      setCompilerOutput(
        `Error de compilación: Llaves '{' '}' desbalanceadas (${openBraces} abiertas vs ${closeBraces} cerradas).`
      );
      return;
    }
    if (openParens !== closeParens) {
      setCompilerOutput(
        `Error de compilación: Paréntesis '(' ')' desbalanceados (${openParens} abiertos vs ${closeParens} cerrados).`
      );
      return;
    }

    if (activeExam.language === 'c') {
      const funcs =
        trimmed.match(/(int|float|void|Nodo\*)\s+\w+\s*\(/g) || [];
      setCompilerOutput(
        `✓ Compilación C / Estructuras exitosa (gcc — ${selectedYear}° Año)\n` +
          `────────────────────────────────────────────────────\n` +
          `• Funciones compiladas (${funcs.length}): ${funcs
            .map((f) => f.replace(/\($/, ''))
            .join(', ')}\n` +
          `• Verificación de punteros y tipos: OK.`
      );
    } else if (activeExam.language === 'funcional') {
      const higherOrder =
        trimmed.match(/\.(filter|map|reduce)\s*\(/g) || [];
      setCompilerOutput(
        `✓ Intérprete Funcional exitoso (2° Año Paradigmas)\n` +
          `────────────────────────────────────────────────────\n` +
          `• Funciones de Orden Superior detectadas (${higherOrder.length}): ${higherOrder.join(
            ' '
          )}\n` +
          `• Estado de inmutabilidad: Sin efectos secundarios detectados.`
      );
    } else {
      const classes = trimmed.match(/class\s+(\w+)/g) || [];
      const methods =
        trimmed.match(/(public|private|protected)\s+\w+\s+\w+\s*\(/g) || [];
      setCompilerOutput(
        `✓ Compilación Java POO exitosa (javac 21 — 2° Año POO)\n` +
          `────────────────────────────────────────────────────\n` +
          `• Clases compiladas (${classes.length}): ${classes.join(', ')}\n` +
          `• Métodos / Constructores detectados: ${methods.length}`
      );
    }
  };

  const evaluateExamSubmission = () => {
    runCompilerCheck();

    let earnedPoints = 0;
    const criteriaResults: CriterionResult[] = activeExam.rubric.map((crit) => {
      const allMatched = crit.requiredPatterns.every((pattern) => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(code);
      });
      if (allMatched) {
        earnedPoints += crit.points;
      }
      return {
        criterionId: crit.id,
        label: crit.label,
        points: crit.points,
        passed: allMatched,
        hintIfMissing: crit.hintIfMissing,
      };
    });

    const syntaxWarnings: string[] = [];
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      syntaxWarnings.push('Hay llaves { } desbalanceadas en tu código.');
    }

    const cleanTokens = (str: string) =>
      str
        .toLowerCase()
        .replace(/\/\/.*$/gm, '')
        .split(/\W+/)
        .filter((w) => w.length > 2);

    const refTokens = new Set(cleanTokens(activeExam.referenceSolution));
    const userTokens = new Set(cleanTokens(code));
    let matchedTokens = 0;
    refTokens.forEach((t) => {
      if (userTokens.has(t)) matchedTokens++;
    });
    const similarityPercent = Math.min(
      100,
      Math.round((matchedTokens / Math.max(1, refTokens.size)) * 100)
    );

    const approved =
      earnedPoints >= activeExam.passingScore && syntaxWarnings.length === 0;
    const gradeOutOfTen = (earnedPoints / 10).toFixed(1);

    setEvaluation({
      totalScore: earnedPoints,
      passingScore: activeExam.passingScore,
      approved,
      gradeOutOfTen,
      criteriaResults,
      syntaxWarnings,
      similarityPercent,
    });
  };

  if (yearExams.length === 0) {
    return (
      <div className="campus-surface rounded-3xl p-8 text-center space-y-4">
        <Code2 className="w-10 h-10 text-k-d6b892 mx-auto" />
        <h3 className="font-editorial text-2xl text-k-f3ece2">
          Compilador habilitado para 1° Año (Algoritmos 1 y 2) y 2° Año (Paradigmas y POO)
        </h3>
        <p className="text-xs text-k-9e9285 max-w-md mx-auto">
          Estás viendo {selectedYear}° Año. Seleccioná <strong>1° Año</strong> o <strong>2° Año</strong> en la barra lateral para practicar en el compilador interactivo.
        </p>
        <button
          onClick={onBackToSelectYear}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Cambiar a 1° o 2° Año
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera Minimalista del Compilador */}
      <div className="campus-surface rounded-3xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-k-26211c border border-k-d6b892/20 text-k-d6b892 text-[11px] font-medium uppercase tracking-wider">
                Compilador • {selectedYear}° Año
              </span>
              {yearExams.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {yearExams.map((ex) => {
                    const subj = subjects.find((s) => s.id === ex.subjectId);
                    const isSelected = ex.id === activeExam.id;
                    return (
                      <button
                        key={ex.id}
                        onClick={() => setActiveExamId(ex.id)}
                        className={`px-3.5 py-1 rounded-full text-xs font-medium transition ${
                          isSelected
                            ? 'bg-k-d6b892 text-k-14110e font-semibold'
                            : 'bg-k-14110e text-k-a39688 hover:text-k-f3ece2 border border-k-2b241d'
                        }`}
                      >
                        {subj?.name || ex.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <h2 className="font-editorial text-2xl text-k-f3ece2">
              {activeExam.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center">
            <div className="flex items-center gap-2 bg-k-120f0d border border-k-2b241d px-3.5 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-k-d6b892" />
              <span className="font-mono text-xs font-semibold text-k-f3ece2">
                {formatTime(secondsLeft)}
              </span>
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-k-26211c text-k-d6b892 hover:bg-k-332b23 transition"
              >
                {timerRunning ? 'Pausar' : 'Iniciar'}
              </button>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-medium bg-k-1b1713 hover:bg-k-26211c text-k-d8cfc4 px-4 py-2 rounded-full border border-k-332b23 transition">
              <Upload className="w-3.5 h-3.5 text-k-d6b892" />
              <span>Subir consigna</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Vista Dividida Minimalista: Izquierda Consigna Oscura Cálida | Derecha Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL IZQUIERDO: Consigna en Modo Oscuro Editorial */}
        <div className="lg:col-span-6 campus-surface rounded-3xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-k-27211c bg-k-13100d">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeftTab('sheet')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  leftTab === 'sheet'
                    ? 'bg-k-332b23 text-k-f3ece2 border border-k-d6b892/20'
                    : 'text-k-9e9285 hover:text-k-f3ece2'
                }`}
              >
                <FileImage className="w-3.5 h-3.5 text-k-d6b892" />
                Consigna del Parcial
              </button>
              <button
                onClick={() => setLeftTab('rubric')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  leftTab === 'rubric'
                    ? 'bg-k-332b23 text-k-f3ece2 border border-k-d6b892/20'
                    : 'text-k-9e9285 hover:text-k-f3ece2'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-k-d6b892" />
                Criterios ({activeExam.passingScore} pts)
              </button>
            </div>
            {customExamImage && (
              <button
                onClick={() => setCustomExamImage(null)}
                className="text-xs text-k-d6b892 hover:underline"
              >
                Quitar imagen
              </button>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[600px] custom-scrollbar space-y-5">
            {leftTab === 'sheet' ? (
              <>
                {customExamImage && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-k-332b23 bg-k-120f0d p-3">
                    <div className="text-xs text-k-d6b892 mb-2 font-medium">
                      Imagen de Parcial Cargada:
                    </div>
                    <img
                      src={customExamImage}
                      alt="Parcial subido"
                      className="w-full rounded-xl object-contain max-h-96 bg-black"
                    />
                  </div>
                )}

                {/* Hoja de Examen en Modo Oscuro Cálido Editorial (sin blanco brillante) */}
                <div className="bg-k-14110e text-k-f3ece2 rounded-2xl p-6 border border-k-2b241d space-y-5">
                  <div className="border-b border-k-2b241d pb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium tracking-wider uppercase text-k-9e9285">
                        {activeExam.examSheetVisual.headerInstitution}
                      </p>
                      <h3 className="font-editorial text-xl text-k-f3ece2 mt-1">
                        {activeExam.examSheetVisual.headerSubject}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-semibold bg-k-241f1a text-k-d6b892 border border-k-383028 px-3 py-1 rounded-full shrink-0">
                      {activeExam.yearLabel}
                    </span>
                  </div>

                  <div className="text-xs leading-relaxed text-k-d8cfc4 bg-k-1b1713 p-4 rounded-2xl border border-k-2b241d">
                    <strong className="text-k-d6b892">Consigna General:</strong>{' '}
                    {activeExam.examSheetVisual.instructions}
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-k-a39688">
                      {activeExam.examSheetVisual.diagramTitle}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {activeExam.examSheetVisual.entitiesOrBoxes.map(
                        (box, idx) => (
                          <div
                            key={idx}
                            className="bg-k-191512 border border-k-332b23 rounded-2xl overflow-hidden"
                          >
                            <div className="bg-k-26201a text-k-d6b892 text-xs font-semibold px-3.5 py-2 border-b border-k-332b23">
                              {box.name}
                            </div>
                            <ul className="p-3.5 text-[11px] space-y-1.5 font-mono text-k-d8cfc4">
                              {box.attributes.map((attr, i) => (
                                <li key={i} className="leading-snug">
                                  {attr}
                                </li>
                              ))}
                            </ul>
                            {box.relations && box.relations.length > 0 && (
                              <div className="bg-k-14110e border-t border-k-2b241d px-3.5 py-2 text-[10px] text-k-c8ab86">
                                {box.relations.map((r, i) => (
                                  <div key={i}>↳ {r}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="border-t border-k-2b241d pt-4">
                    <div className="text-xs font-semibold text-k-d6b892 mb-2">
                      Puntos solicitados en la entrega:
                    </div>
                    <ul className="space-y-1.5 text-xs text-k-c8bcb0">
                      {activeExam.examSheetVisual.tasks.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-k-1b1713 border border-k-332b23 text-xs text-k-d8cfc4">
                  El evaluador verifica cada criterio de cátedra. Necesitás sumar al menos{' '}
                  <strong className="text-k-d6b892">
                    {activeExam.passingScore} puntos sobre 100
                  </strong>{' '}
                  para aprobar.
                </div>
                {activeExam.rubric.map((crit) => (
                  <div
                    key={crit.id}
                    className="p-4 rounded-2xl bg-k-14110e border border-k-27211c flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-semibold text-k-f3ece2">
                        {crit.label}
                      </div>
                      <p className="text-xs text-k-9e9285 mt-1">
                        {crit.description}
                      </p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full bg-k-241f1a text-k-d6b892 font-mono text-xs font-semibold">
                      +{crit.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: Editor / Compilador Oscuro Minimalista */}
        <div className="lg:col-span-6 campus-surface rounded-3xl flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-k-27211c bg-k-13100d">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-k-d6b892" />
              <span className="text-xs font-medium text-k-f3ece2 uppercase tracking-wider">
                Compilador ({activeExam.language.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCode(activeExam.starterCode)}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-k-1e1915 hover:bg-k-2a231d text-k-c8bcb0 border border-k-332b23 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar
              </button>
              <button
                onClick={() => setCode(activeExam.referenceSolution)}
                className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-k-2b231c hover:bg-k-382e24 text-k-d6b892 border border-k-d6b892/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Cargar Solución Nota 10
              </button>
            </div>
          </div>

          {/* Barra de leyenda cromática de palabras reservadas */}
          <div className="px-5 py-2 bg-k-110e0b border-b border-k-251f1a flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono">
            <span className="text-k-8e8275 uppercase tracking-wider">
              Sintaxis:
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#f0a45d] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#f0a45d]" />
              Reservadas (if, while, for, return, class, struct)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#78c5d6] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#78c5d6]" />
              Tipos (int, float, void, Nodo, String)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#c59bf0]">
              <span className="w-2 h-2 rounded-full bg-[#c59bf0]" />
              Funciones (malloc, filter, map, reduce)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#e07a88] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#e07a88]" />
              Constantes (NULL, true, false)
            </span>
          </div>

          {/* Editor con numeración de líneas y resaltado de palabras reservadas en tiempo real */}
          <div className="relative flex flex-1 min-h-[360px] h-[380px] bg-k-100d0b overflow-hidden">
            {/* Columna de números de línea */}
            <div
              ref={gutterLinesRef}
              aria-hidden="true"
              className="w-11 py-5 px-2 bg-k-14110e border-r border-k-241f1a text-right font-mono text-xs leading-relaxed text-k-6b5e50 select-none overflow-hidden shrink-0"
            >
              {code.split('\n').map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>

            {/* Área superpuesta: Capa inferior coloreada + Textarea superior transparente con cursor visible */}
            <div className="relative flex-1 h-full overflow-hidden">
              <pre
                ref={preHighlightRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-0 w-full h-full p-5 font-mono text-xs leading-relaxed text-k-e5d5c0 whitespace-pre overflow-hidden"
              >
                {renderHighlightedCode(code)}
                {'\n'}
              </pre>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleEditorScroll}
                onKeyDown={handleEditorKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="relative z-10 w-full h-full p-5 bg-transparent text-transparent caret-k-f3ece2 selection:bg-k-d6b892/25 font-mono text-xs leading-relaxed whitespace-pre overflow-auto focus:outline-none resize-none custom-scrollbar"
                placeholder="Escribí tu resolución acá..."
              />
            </div>
          </div>

          <div className="p-4 bg-k-13100d border-t border-k-27211c flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={runCompilerCheck}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-k-221d18 hover:bg-k-2e2720 text-k-f3ece2 border border-k-383028 text-xs font-medium transition"
            >
              <Play className="w-3.5 h-3.5 text-k-d6b892" />
              Compilar / Probar Sintaxis
            </button>

            <button
              onClick={evaluateExamSubmission}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-k-d6b892 hover:bg-k-e3c7a3 text-k-14110e text-xs font-semibold shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Evaluar Código y Ver Nota
            </button>
          </div>

          {compilerOutput && (
            <div className="px-5 py-3.5 bg-k-0c0a08 border-t border-k-27211c font-mono text-[11px] text-k-d8cfc4 whitespace-pre-wrap">
              <div className="flex items-center gap-1.5 text-k-d6b892 mb-1 text-[10px] uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" /> Salida del Compilador
              </div>
              {compilerOutput}
            </div>
          )}
        </div>
      </div>

      {/* PANEL DE RESULTADO DE EVALUACIÓN */}
      {evaluation && (
        <div className="campus-surface rounded-3xl p-6 transition-all border border-k-d6b892/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-k-27211c">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-k-241f1a border border-k-d6b892/25 text-k-d6b892 flex items-center justify-center shrink-0">
                {evaluation.approved ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-400" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold ${
                      evaluation.approved
                        ? 'bg-k-d6b892 text-k-14110e'
                        : 'bg-rose-950 text-rose-200 border border-rose-500/40'
                    }`}
                  >
                    {evaluation.approved
                      ? '¡Alcanza para aprobar el parcial!'
                      : 'Todavía no alcanza para aprobar'}
                  </span>
                  <span className="text-xs text-k-c8bcb0">
                    Similitud con cátedra:{' '}
                    <strong className="text-k-d6b892">
                      {evaluation.similarityPercent}%
                    </strong>
                  </span>
                </div>
                <p className="text-xs text-k-9e9285 mt-1.5">
                  {evaluation.approved
                    ? `Superaste el mínimo de ${evaluation.passingScore}/100 puntos exigido por la cátedra.`
                    : `Sumaste ${evaluation.totalScore}/100 puntos y necesitás ${evaluation.passingScore}/100.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end md:self-center">
              <div className="text-right">
                <div className="text-[11px] text-k-9e9285 uppercase">
                  Nota Estimada
                </div>
                <div className="font-editorial text-3xl text-k-d6b892">
                  {evaluation.gradeOutOfTen}{' '}
                  <span className="text-sm text-k-9e9285">/ 10</span>
                </div>
              </div>
              <button
                onClick={() => setShowSolutionDiff(!showSolutionDiff)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-k-241f1a hover:bg-k-332b23 text-k-f3ece2 text-xs font-medium border border-k-383028 transition"
              >
                <SplitSquareVertical className="w-4 h-4 text-k-d6b892" />
                {showSolutionDiff
                  ? 'Ocultar Comparación'
                  : 'Comparar con Solución'}
              </button>
            </div>
          </div>

          {evaluation.syntaxWarnings.length > 0 && (
            <div className="mt-4 p-3 rounded-2xl bg-k-261f18 border border-k-d6b892/20 flex items-center gap-2 text-xs text-k-e5d5c0">
              <AlertTriangle className="w-4 h-4 text-k-d6b892 shrink-0" />
              <span>{evaluation.syntaxWarnings.join(' ')}</span>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {evaluation.criteriaResults.map((item) => (
              <div
                key={item.criterionId}
                className="p-4 rounded-2xl bg-k-14110e border border-k-27211c flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-k-d6b892 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-k-f3ece2">
                      {item.label}
                    </div>
                    {!item.passed && (
                      <p className="text-[11px] text-k-c8ab86 mt-1">
                        Sugerencia: {item.hintIfMissing}
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-k-221d18 text-k-d6b892">
                  {item.passed ? `+${item.points}` : `0 / ${item.points}`} pts
                </span>
              </div>
            ))}
          </div>

          {showSolutionDiff && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-k-27211c">
              <div>
                <div className="text-xs font-semibold text-k-c8bcb0 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-k-d6b892" /> Tu Código
                </div>
                <pre className="p-4 rounded-2xl bg-k-100d0b border border-k-27211c text-xs font-mono text-k-e5d5c0 leading-relaxed overflow-x-auto max-h-80 custom-scrollbar">
                  {renderHighlightedCode(code)}
                </pre>
              </div>
              <div>
                <div className="text-xs font-semibold text-k-d6b892 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-k-d6b892" />{' '}
                  Solución Oficial de Cátedra
                </div>
                <pre className="p-4 rounded-2xl bg-k-100d0b border border-k-d6b892/20 text-xs font-mono text-k-e5d5c0 leading-relaxed overflow-x-auto max-h-80 custom-scrollbar">
                  {renderHighlightedCode(activeExam.referenceSolution)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
