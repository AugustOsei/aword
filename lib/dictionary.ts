import type { WordData } from '@/types';

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// In-memory cache so we never re-fetch the same word within a session.
const cache = new Map<string, WordData>();

function fallback(word: string): WordData {
  return {
    word,
    phonetic: '',
    partOfSpeech: '',
    definition: '',
    example: '',
  };
}

/**
 * Fetch definition data for a word. Always resolves — on any failure it returns
 * a fallback with empty fields rather than throwing, so callers can render the
 * word without a definition instead of crashing.
 */
export async function getWordData(word: string): Promise<WordData> {
  const key = word.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(key)}`, {
      // Don't let a slow API stall the UX indefinitely.
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = await res.json();
    const data = parse(word, json);
    cache.set(key, data);
    return data;
  } catch {
    const fb = fallback(word);
    // Cache the fallback too — avoids hammering a down API repeatedly.
    cache.set(key, fb);
    return fb;
  }
}

interface ApiDefinition {
  definition?: string;
  example?: string;
}
interface ApiMeaning {
  partOfSpeech?: string;
  definitions?: ApiDefinition[];
}
interface ApiPhonetic {
  text?: string;
}
interface ApiEntry {
  phonetic?: string;
  phonetics?: ApiPhonetic[];
  meanings?: ApiMeaning[];
}

function parse(word: string, json: unknown): WordData {
  if (!Array.isArray(json) || json.length === 0) return fallback(word);
  const entry = json[0] as ApiEntry;

  let phonetic = entry.phonetic || '';
  if (!phonetic && Array.isArray(entry.phonetics)) {
    const withText = entry.phonetics.find((p) => p && p.text);
    if (withText?.text) phonetic = withText.text;
  }

  // Prefer the first meaning that has at least one definition.
  let partOfSpeech = '';
  let definition = '';
  let example = '';
  if (Array.isArray(entry.meanings)) {
    for (const meaning of entry.meanings) {
      const def = meaning.definitions?.find((d) => d && d.definition);
      if (def) {
        partOfSpeech = meaning.partOfSpeech || '';
        definition = def.definition || '';
        // Find an example anywhere in this meaning if the chosen def lacks one.
        example =
          def.example ||
          meaning.definitions?.find((d) => d && d.example)?.example ||
          '';
        break;
      }
    }
  }

  return { word, phonetic, partOfSpeech, definition, example };
}
