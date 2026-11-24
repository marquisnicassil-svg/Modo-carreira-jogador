export interface FaceBox {
  ymin: number; // 0..1000
  xmin: number; // 0..1000
  ymax: number; // 0..1000
  xmax: number; // 0..1000
  cx?: number; // 0..1000 exact face center X
  cy?: number; // 0..1000 exact face center Y
}

export interface ProcessedPhotoResult {
  /** Final 256x256 portrait Data URL (face-focused if detected, otherwise standard crop) */
  photo: string;
  /** Standard center-square crop so user can toggle if desired */
  fullCrop: string;
  /** Whether a face was detected and focused */
  faceFocused: boolean;
  /** Status label for the UI */
  statusText: string;
  /** Optional API error message if backend returned an upstream error */
  apiError?: string;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Arquivo selecionado não é uma imagem válida.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error('Imagem vazia.'));
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem não suportado.'));
      img.onload = () => resolve(img);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function renderCenterSquareCrop(img: HTMLImageElement, targetSize = 256): string {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const minSide = Math.min(w, h);
  const sx = (w - minSide) / 2;
  // Slightly favor upper-center for portraits
  const sy = Math.max(0, Math.min(h - minSide, (h - minSide) * 0.35));

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img.src;
  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);
  return canvas.toDataURL('image/jpeg', 0.86);
}

function renderFaceBoxCrop(img: HTMLImageElement, box: FaceBox, targetSize = 256): string {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  const faceLeft = (box.xmin / 1000) * w;
  const faceTop = (box.ymin / 1000) * h;
  const faceRight = (box.xmax / 1000) * w;
  const faceBottom = (box.ymax / 1000) * h;

  const faceW = Math.max(12, faceRight - faceLeft);
  const faceH = Math.max(12, faceBottom - faceTop);

  const centerX =
    typeof box.cx === 'number' ? (box.cx / 1000) * w : faceLeft + faceW / 2;
  const centerY =
    typeof box.cy === 'number' ? (box.cy / 1000) * h : faceTop + faceH * 0.48;

  // Tightly frame the face (1.42x) so surrounding crowd/elements are cropped out
  const minFaceSide = Math.max(faceW, faceH) * 1.15;
  let side = Math.min(Math.max(faceW, faceH) * 1.42, w, h);

  // Keep the face strictly centered whenever possible without clipping the face itself
  const maxCenteredSide = 2 * Math.min(centerX, w - centerX, centerY, h - centerY);
  if (maxCenteredSide >= minFaceSide && maxCenteredSide < side) {
    side = maxCenteredSide;
  }

  let sx = centerX - side / 2;
  let sy = centerY - side / 2;

  // Clamp inside image bounds
  sx = Math.max(0, Math.min(w - side, sx));
  sy = Math.max(0, Math.min(h - side, sy));

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return renderCenterSquareCrop(img, targetSize);
  ctx.drawImage(img, sx, sy, side, side, 0, 0, targetSize, targetSize);
  return canvas.toDataURL('image/jpeg', 0.88);
}

function createAnalysisBase64(img: HTMLImageElement): string {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const maxDim = 1280;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(img, 0, 0, cw, ch);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return dataUrl.split(',')[1] || '';
}

async function detectFaceWithBrowserApi(img: HTMLImageElement): Promise<FaceBox | null> {
  type BrowserFace = { boundingBox: { x: number; y: number; width: number; height: number } };
  type FaceDetectorCtor = new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
    detect: (source: HTMLImageElement) => Promise<BrowserFace[]>;
  };

  const win = window as unknown as { FaceDetector?: FaceDetectorCtor };
  if (typeof win.FaceDetector !== 'function') return null;

  try {
    const detector = new win.FaceDetector({ fastMode: false, maxDetectedFaces: 5 });
    const faces = await detector.detect(img);
    if (!faces || faces.length === 0) return null;

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    // Choose largest foreground face
    const primary = [...faces].sort(
      (a, b) =>
        b.boundingBox.width * b.boundingBox.height - a.boundingBox.width * a.boundingBox.height
    )[0];

    const bb = primary.boundingBox;
    return {
      xmin: Math.round((bb.x / w) * 1000),
      ymin: Math.round((bb.y / h) * 1000),
      xmax: Math.round(((bb.x + bb.width) / w) * 1000),
      ymax: Math.round(((bb.y + bb.height) / h) * 1000),
    };
  } catch {
    return null;
  }
}

/**
 * Processes an uploaded player photo, using server-side Gemini Vision AI
 * to locate and zoom onto the player's face (filtering out busy backgrounds
 * or multiple people), with graceful browser FaceDetector fallback on static hosts.
 */
export async function processPlayerPhotoFile(
  file: File,
  playerName?: string
): Promise<ProcessedPhotoResult> {
  const img = await loadImageElement(file);
  const fullCrop = renderCenterSquareCrop(img, 256);
  const base64 = createAnalysisBase64(img);

  const canCallApi =
    typeof window !== 'undefined' &&
    window.location.protocol !== 'file:' &&
    (typeof navigator === 'undefined' || navigator.onLine !== false);

  if (base64 && canCallApi) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch('./api/detect-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
          playerName,
        }),
      });
      window.clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = (await response.json()) as {
          found?: boolean;
          box?: FaceBox | null;
          error?: string;
          apiError?: boolean;
        };

        if (!response.ok) {
          return {
            photo: fullCrop,
            fullCrop,
            faceFocused: false,
            statusText: '',
            apiError: data.error || 'Erro ao analisar rosto com a IA.',
          };
        }

        if (data.found && data.box) {
          const focused = renderFaceBoxCrop(img, data.box, 256);
          return {
            photo: focused,
            fullCrop,
            faceFocused: true,
            statusText: 'Rosto focado automaticamente pela IA',
          };
        }

        return {
          photo: fullCrop,
          fullCrop,
          faceFocused: false,
          statusText: 'Nenhum rosto destacado na foto · enquadramento padrão',
        };
      }
    } catch {
      window.clearTimeout(timeoutId);
      // Static hosting or offline APK without backend: fall through to browser FaceDetector
    }
  }

  // Browser FaceDetector fallback for static GitHub Pages deployments
  const browserBox = await detectFaceWithBrowserApi(img);
  if (browserBox) {
    return {
      photo: renderFaceBoxCrop(img, browserBox, 256),
      fullCrop,
      faceFocused: true,
      statusText: 'Rosto focado automaticamente',
    };
  }

  return {
    photo: fullCrop,
    fullCrop,
    faceFocused: false,
    statusText: 'Enquadramento padrão aplicado',
  };
}
