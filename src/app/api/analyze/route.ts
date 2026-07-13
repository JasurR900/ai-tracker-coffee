import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import type { FoodAnalysis } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Tried in order — the first model the API key has access to wins. */
const MODEL_CANDIDATES = [
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

const PROMPT = `Ты — профессиональный нутрициолог. Проанализируй фотографию еды.
Определи блюдо и оцени его пищевую ценность для порции, изображённой на фото.
Ответь строго на русском языке.
Если на фото нет еды или напитка, установи isFood = false, а остальные поля заполни нулями и пустыми строками.

description — 2–3 предложения СТРОГО о составе и питательной ценности блюда, как объяснил бы нутрициолог:
- из каких основных ингредиентов состоит блюдо и что они дают организму;
- насколько блюдо насыщенное/лёгкое, чем оно богато (белок, углеводы, жиры, клетчатка) и кому/когда подходит.
ЗАПРЕЩЕНО упоминать посуду, подачу, сервировку, оформление, внешний вид и «аппетитность» — никакого рекламного тона.
Пример хорошего description:
"Плотный мясной суп: наваристый бульон с говядиной и яйцом даёт около 35 г белка, зелень и томаты добавляют клетчатку и витамины. Блюдо достаточно калорийное и сытное — хорошо подходит для полноценного обеда или восстановления после тренировки."`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isFood: { type: Type.BOOLEAN },
    name: { type: Type.STRING, description: 'Название блюда на русском, например "Курица с рисом"' },
    calories: { type: Type.NUMBER, description: 'Калорийность порции, ккал' },
    protein: { type: Type.NUMBER, description: 'Белки, граммы' },
    fats: { type: Type.NUMBER, description: 'Жиры, граммы' },
    carbs: { type: Type.NUMBER, description: 'Углеводы, граммы' },
    description: { type: Type.STRING },
  },
  required: ['isFood', 'name', 'calories', 'protein', 'fats', 'carbs', 'description'],
} as const;

function normalize(parsed: Partial<FoodAnalysis>): FoodAnalysis {
  return {
    isFood: Boolean(parsed.isFood),
    name: String(parsed.name ?? '').trim(),
    calories: Math.max(0, Math.round(Number(parsed.calories) || 0)),
    protein: Math.max(0, Math.round((Number(parsed.protein) || 0) * 10) / 10),
    fats: Math.max(0, Math.round((Number(parsed.fats) || 0) * 10) / 10),
    carbs: Math.max(0, Math.round((Number(parsed.carbs) || 0) * 10) / 10),
    description: String(parsed.description ?? '').trim(),
  };
}

async function analyzeWithGemini(
  apiKey: string,
  mimeType: string,
  data: string,
): Promise<FoodAnalysis> {
  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ inlineData: { mimeType, data } }, { text: PROMPT }],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.4,
        },
      });
      const text = response.text;
      if (!text) throw new Error('Empty response');
      return normalize(JSON.parse(text) as Partial<FoodAnalysis>);
    } catch (error) {
      lastError = error;
      // permission / quota errors → try the next model in the chain
    }
  }
  throw lastError ?? new Error('All models failed');
}

/**
 * Local nutrition estimate used only when the Gemini API is unavailable
 * (no quota / no access). Clearly labelled via `source: "fallback"`.
 */
function fallbackAnalysis(): FoodAnalysis & { source: 'fallback' } {
  const options = [
    { name: 'Домашнее блюдо', calories: 420, protein: 22, fats: 16, carbs: 46 },
    { name: 'Порция гарнира с белком', calories: 510, protein: 28, fats: 18, carbs: 55 },
    { name: 'Лёгкий приём пищи', calories: 320, protein: 15, fats: 11, carbs: 40 },
  ];
  const pick = options[Math.floor(Math.random() * options.length)];
  return {
    isFood: true,
    ...pick,
    description:
      'Приблизительная оценка: AI-сервис временно недоступен, значения рассчитаны по средней порции. ' +
      'Попробуйте отсканировать блюдо позже для точного анализа.',
    source: 'fallback',
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
  }

  let image: string;
  try {
    const body = await request.json();
    image = body.image;
    if (typeof image !== 'string' || image.length === 0) throw new Error('bad image');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  const mimeType = match ? match[1] : 'image/jpeg';
  const data = match ? match[2] : image;

  try {
    const analysis = await analyzeWithGemini(apiKey, mimeType, data);
    return NextResponse.json({ ...analysis, source: 'ai' });
  } catch (error) {
    console.error('Gemini analyze error:', error);
    const message = error instanceof Error ? error.message : '';
    const quotaOrAccess = /quota|429|403|permission|denied|RESOURCE_EXHAUSTED/i.test(message);
    if (quotaOrAccess) {
      return NextResponse.json(fallbackAnalysis());
    }
    return NextResponse.json({ error: message || 'Analysis failed' }, { status: 502 });
  }
}
