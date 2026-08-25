/**
 * PDF export.
 *
 * The document already knows how to draw itself at true A4 geometry, so the
 * export does not re-implement the layout: it un-scales the live document,
 * parks it off-screen, rasterises each `.avct-page` at print resolution and
 * drops each one onto its own A4 page. Preview, print and PDF therefore come
 * from the same DOM and cannot drift apart.
 */

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

/** Capture resolution. 3x of 96dpi CSS ≈ 288 dpi — comfortably print grade. */
const CAPTURE_SCALE = 3;
const JPEG_QUALITY = 0.94;

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** Longest we wait for layout to settle before capturing anyway. */
const LAYOUT_SETTLE_TIMEOUT_MS = 400;
/** Guard against a font request that never resolves. */
const FONT_READY_TIMEOUT_MS = 4000;

export interface ExportProgress {
  page: number;
  total: number;
}

export class PdfExportError extends Error {
  override readonly name = "PdfExportError";
}

/** Waits for webfonts and every image inside `root` to be ready to paint. */
async function waitForAssets(root: HTMLElement): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, FONT_READY_TIMEOUT_MS)),
      ]);
    } catch {
      /* Font loading is best-effort; a fallback face still renders. */
    }
  }

  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return;
      await new Promise<void>((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
        // A broken or stalled image must not block the whole export.
        setTimeout(done, FONT_READY_TIMEOUT_MS);
      });
    }),
  );

  // One more frame so layout settles after the exporting class is applied.
  // Raced against a timer: requestAnimationFrame is paused in a background
  // tab, and an export must not hang because the applicant switched tabs.
  await new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    requestAnimationFrame(() => requestAnimationFrame(done));
    setTimeout(done, LAYOUT_SETTLE_TIMEOUT_MS);
  });
}

/**
 * Renders the pages inside `root` into a PDF blob.
 * `root` must be the `.avct-doc` element containing `.avct-page` children.
 */
export async function renderDocumentToPdf(
  root: HTMLElement,
  onProgress?: (progress: ExportProgress) => void,
): Promise<Blob> {
  const pages = Array.from(root.querySelectorAll<HTMLElement>(".avct-page"));
  if (pages.length === 0) {
    throw new PdfExportError("The application form has not finished rendering yet.");
  }

  const wasExporting = root.classList.contains("avct-doc--exporting");
  // The PDF is always the complete official form, section (17) included and
  // blank, even when the applicant was previewing without it.
  const previousMode = root.dataset.mode;
  root.classList.add("avct-doc--exporting");
  root.dataset.mode = "official";

  try {
    await waitForAssets(root);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    pdf.setProperties({
      title: "Tzu Chi Commissioner / Faith Corps Training Application Form",
      creator: "Tzu Chi AVCT Portal",
    });

    for (let index = 0; index < pages.length; index += 1) {
      onProgress?.({ page: index + 1, total: pages.length });

      const canvas = await html2canvas(pages[index], {
        scale: CAPTURE_SCALE,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        // The page is exactly A4; pinning the size avoids sub-pixel drift.
        width: pages[index].offsetWidth,
        height: pages[index].offsetHeight,
        windowWidth: pages[index].offsetWidth,
        windowHeight: pages[index].offsetHeight,
      });

      const image = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      if (index > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(image, "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, "FAST");

      // Release the backing store early; eight 2381x3367 canvases is a lot.
      canvas.width = 0;
      canvas.height = 0;
    }

    return pdf.output("blob");
  } finally {
    if (!wasExporting) root.classList.remove("avct-doc--exporting");
    if (previousMode === undefined) delete root.dataset.mode;
    else root.dataset.mode = previousMode;
  }
}

/** Turns a display name into a safe, readable file name stem. */
export function fileStem(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "AVCT-Application";
}

/** Downloads `blob` as `filename` using a transient object URL. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function exportDocumentAsPdf(
  root: HTMLElement,
  applicantName: string,
  onProgress?: (progress: ExportProgress) => void,
): Promise<void> {
  const blob = await renderDocumentToPdf(root, onProgress);
  downloadBlob(blob, `${fileStem(applicantName)}-AVCT-Application.pdf`);
}
