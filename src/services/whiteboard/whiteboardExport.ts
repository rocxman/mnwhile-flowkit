import { exportToBlob, exportToSvg } from '@excalidraw/excalidraw';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

export async function exportWhiteboardToPNG(
  elements: ExcalidrawElement[],
  filename = 'whiteboard.png'
) {
  const blob = await exportToBlob({
    elements,
    appState: { exportBackground: true },
    files: null,
    getDimensions: () => ({ width: 1920, height: 1080, scale: 2 }),
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportWhiteboardToSVG(
  elements: ExcalidrawElement[],
  filename = 'whiteboard.svg'
) {
  const svg = await exportToSvg({
    elements,
    appState: { exportBackground: true },
    files: null,
  });

  const svgString = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
