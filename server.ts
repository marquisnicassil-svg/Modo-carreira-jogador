import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

function createGeminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.post('/api/detect-face', async (req, res) => {
  const { imageBase64, mimeType, playerName } = req.body ?? {};

  if (typeof imageBase64 !== 'string' || !imageBase64.trim() || typeof mimeType !== 'string') {
    return res.status(400).json({
      error: 'Imagem inválida para análise.',
      apiError: false,
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error:
        'Chave da API Gemini (GEMINI_API_KEY) não configurada. Verifique em Settings > Secrets.',
      apiError: true,
    });
  }

  try {
    const ai = createGeminiClient();
    const subjectHint =
      typeof playerName === 'string' && playerName.trim()
        ? `If recognizable, prioritize the player named "${playerName.trim()}". `
        : '';

    const prompt =
      `${subjectHint}Detect the single main foreground football player's FACE in this image, even if the photo is crowded with many elements (stadium crowd, teammates, opponents, trophies, ball, banners, full body). ` +
      `Return ONLY the tight bounding box around the player's HEAD/FACE (from top of hair/forehead to bottom of chin, ear to ear — do NOT include torso, jersey, arms, or background) using normalized coordinates 0..1000 as box_2d [ymin, xmin, ymax, xmax], ` +
      `and also return faceCenter [y, x] (0..1000) pointing to the center of the face (bridge of the nose / between the eyes). ` +
      `If no human face is visible, set found to false.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetDescription: {
              type: Type.STRING,
              description:
                'Brief description of where the main player face is located in the image.',
            },
            found: {
              type: Type.BOOLEAN,
              description: 'True if a human face was detected in the image.',
            },
            box_2d: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description:
                'Tight bounding box of ONLY the main player face as [ymin, xmin, ymax, xmax] normalized 0..1000.',
            },
            faceCenter: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description:
                'Center point of the face (between eyes / nose bridge) as [y, x] normalized 0..1000.',
            },
          },
          required: ['targetDescription', 'found', 'box_2d', 'faceCenter'],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    const parsed = JSON.parse(rawText) as {
      found?: boolean;
      box_2d?: number[];
      faceCenter?: number[];
    };

    const found = Boolean(parsed?.found);
    const coords = Array.isArray(parsed?.box_2d) ? parsed.box_2d : [];
    const ymin = Number(coords[0]);
    const xmin = Number(coords[1]);
    const ymax = Number(coords[2]);
    const xmax = Number(coords[3]);

    const centerArr = Array.isArray(parsed?.faceCenter) ? parsed.faceCenter : [];
    const cy = Number(centerArr[0]);
    const cx = Number(centerArr[1]);

    const isValidBox =
      found &&
      coords.length === 4 &&
      Number.isFinite(ymin) &&
      Number.isFinite(xmin) &&
      Number.isFinite(ymax) &&
      Number.isFinite(xmax) &&
      ymax > ymin &&
      xmax > xmin;

    if (!isValidBox) {
      return res.json({ found: false, box: null });
    }

    const clampedBox = {
      ymin: Math.max(0, Math.min(1000, ymin)),
      xmin: Math.max(0, Math.min(1000, xmin)),
      ymax: Math.max(0, Math.min(1000, ymax)),
      xmax: Math.max(0, Math.min(1000, xmax)),
    };

    const hasValidCenter =
      centerArr.length === 2 &&
      Number.isFinite(cy) &&
      Number.isFinite(cx) &&
      cx >= clampedBox.xmin &&
      cx <= clampedBox.xmax &&
      cy >= clampedBox.ymin &&
      cy <= clampedBox.ymax;

    return res.json({
      found: true,
      box: {
        ...clampedBox,
        ...(hasValidCenter
          ? {
              cx: Math.max(0, Math.min(1000, cx)),
              cy: Math.max(0, Math.min(1000, cy)),
            }
          : {}),
      },
    });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : String(err ?? '');
    let friendly = 'Erro ao analisar rosto com a IA Gemini.';

    if (
      raw.includes('PERMISSION_DENIED') ||
      raw.includes('API_KEY_INVALID') ||
      raw.includes('reported as leaked') ||
      raw.includes('403') ||
      raw.includes('400')
    ) {
      friendly =
        'A chave da API Gemini (GEMINI_API_KEY) está inválida ou bloqueada. Atualize a chave em Settings > Secrets para usar o foco facial por IA.';
    } else if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
      friendly = 'Limite de requisições da API Gemini atingido. Tente novamente em instantes.';
    }

    return res.status(502).json({
      error: friendly,
      apiError: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
