// ── Grant Report PDF Generator ──────────────────────────────────────────────
// Generates a professional compliance report PDF using jsPDF.
// Uses real artwork data from Firestore via deriveMetrics functions.

import { jsPDF } from 'jspdf';
import {
  deriveAudioCoverage,
  deriveAudioCounts,
  deriveGalleryBreakdown,
  deriveOverallArScore,
  deriveAnchorCounts,
} from './deriveMetrics';

const GREEN = [20, 184, 96];
const DARK  = [17, 24, 39];
const GOLD  = [212, 175, 55];
const GREY  = [156, 163, 175];
const LIGHT = [229, 231, 235];

/**
 * Generate and download a grant report PDF.
 * @param {object} options
 * @param {string} options.reportType - Report type ID (ada_annual, audio, accessibility, ar_audit)
 * @param {string} options.reportLabel - Report type display name
 * @param {string} options.period - Period string (e.g., "Q1 2026")
 * @param {string} options.institutionName - Institution name
 * @param {Array} options.artworks - Real artworks array from Firestore
 */
export function generateReportPDF({ reportType, reportLabel, period, institutionName, artworks = [] }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 20;

  // ── Helpers ──────────────────────────────────────────────────────────────
  function addText(text, x, yPos, { size = 10, color = DARK, font = 'helvetica', style = 'normal', maxWidth } = {}) {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    if (maxWidth) {
      doc.text(text, x, yPos, { maxWidth });
    } else {
      doc.text(text, x, yPos);
    }
  }

  function addLine(yPos, color = LIGHT) {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(20, yPos, W - 20, yPos);
  }

  function addStat(label, value, x, yPos, color = DARK) {
    addText(value, x, yPos, { size: 18, color, style: 'bold' });
    addText(label, x, yPos + 6, { size: 8, color: GREY });
  }

  function checkPage(needed = 30) {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  }

  // ── Header ──────────────────────────────────────────────────────────────
  // Green accent bar
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 4, 'F');

  // Logo text
  addText('GESTALT', 20, 16, { size: 10, color: GREEN, style: 'bold' });
  addText('Institution Report', 50, 16, { size: 10, color: GREY });

  // Report title
  y = 30;
  addText(reportLabel, 20, y, { size: 22, style: 'bold' });
  y += 8;
  addText(`${institutionName}  ·  ${period}`, 20, y, { size: 10, color: GREY });
  y += 4;
  addLine(y);
  y += 10;

  // Generated date
  addText(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, y, { size: 8, color: GREY });
  y += 12;

  // ── Key Metrics ─────────────────────────────────────────────────────────
  const audio = deriveAudioCoverage(artworks);
  const audioCounts = deriveAudioCounts(artworks);
  const arScore = deriveOverallArScore(artworks);
  const galleries = deriveGalleryBreakdown(artworks);
  const anchors = deriveAnchorCounts(artworks);

  addText('KEY METRICS', 20, y, { size: 8, color: GREY, style: 'bold' });
  y += 8;

  // Metric boxes row
  addStat(`${audio.percent}%`, `${audio.percent}%`, 20, y, GREEN);
  addText('Audio Coverage', 20, y + 6, { size: 8, color: GREY });

  addStat(String(artworks.length), String(artworks.length), 65, y, DARK);
  addText('Total Artworks', 65, y + 6, { size: 8, color: GREY });

  addStat(String(galleries.length), String(galleries.length), 110, y, DARK);
  addText('Galleries', 110, y + 6, { size: 8, color: GREY });

  addStat(arScore != null ? arScore.toFixed(2) : 'N/A', arScore != null ? arScore.toFixed(2) : 'N/A', 155, y, GOLD);
  addText('AR Reliability', 155, y + 6, { size: 8, color: GREY });

  y += 18;
  addLine(y);
  y += 10;

  // ── Audio Description Status ────────────────────────────────────────────
  if (reportType === 'ada_annual' || reportType === 'audio' || reportType === 'accessibility') {
    checkPage(40);
    addText('AUDIO DESCRIPTION STATUS', 20, y, { size: 8, color: GREY, style: 'bold' });
    y += 8;

    addText(`Covered: ${audioCounts.covered} artworks with published audio`, 20, y, { size: 10 });
    y += 6;
    addText(`Pending: ${audioCounts.pending} artworks with scripts awaiting synthesis`, 20, y, { size: 10 });
    y += 6;
    addText(`Missing: ${audioCounts.missing} artworks without any audio content`, 20, y, { size: 10, color: audioCounts.missing > 0 ? [226, 75, 74] : DARK });
    y += 10;

    // Coverage bar
    doc.setFillColor(...LIGHT);
    doc.roundedRect(20, y, W - 40, 4, 2, 2, 'F');
    if (audio.percent > 0) {
      doc.setFillColor(...GREEN);
      doc.roundedRect(20, y, Math.max(4, (W - 40) * (audio.percent / 100)), 4, 2, 2, 'F');
    }
    y += 12;
    addLine(y);
    y += 10;
  }

  // ── Gallery Breakdown ───────────────────────────────────────────────────
  if (galleries.length > 0) {
    checkPage(20 + galleries.length * 8);
    addText('GALLERY BREAKDOWN', 20, y, { size: 8, color: GREY, style: 'bold' });
    y += 8;

    // Table header
    addText('Gallery', 20, y, { size: 8, color: GREY, style: 'bold' });
    addText('Artworks', 100, y, { size: 8, color: GREY, style: 'bold' });
    addText('Audio %', 130, y, { size: 8, color: GREY, style: 'bold' });
    addText('AR Score', 160, y, { size: 8, color: GREY, style: 'bold' });
    y += 3;
    addLine(y, LIGHT);
    y += 5;

    for (const g of galleries) {
      checkPage(10);
      addText(g.name.length > 30 ? g.name.slice(0, 30) + '...' : g.name, 20, y, { size: 9 });
      addText(String(g.artworkCount), 100, y, { size: 9 });
      addText(`${g.audioCoveragePct}%`, 130, y, { size: 9, color: g.audioCoveragePct >= 80 ? GREEN : g.audioCoveragePct >= 50 ? GOLD : [226, 75, 74] });
      addText(g.avgArScore != null ? g.avgArScore.toFixed(2) : '—', 160, y, { size: 9 });
      y += 7;
    }

    y += 5;
    addLine(y);
    y += 10;
  }

  // ── AR Anchor Summary ───────────────────────────────────────────────────
  if (reportType === 'ada_annual' || reportType === 'ar_audit') {
    checkPage(30);
    addText('AR ANCHOR SUMMARY', 20, y, { size: 8, color: GREY, style: 'bold' });
    y += 8;

    addText(`Total anchors: ${anchors.total}`, 20, y, { size: 10 });
    y += 6;
    addText(`Average reliability: ${anchors.avgScore != null ? anchors.avgScore.toFixed(2) : 'N/A'}`, 20, y, { size: 10 });
    y += 6;
    if (anchors.belowThreshold > 0) {
      addText(`Below threshold (< 0.50): ${anchors.belowThreshold}`, 20, y, { size: 10, color: [226, 75, 74] });
    } else {
      addText('All anchors above 0.50 threshold', 20, y, { size: 10, color: GREEN });
    }
    y += 10;
    addLine(y);
    y += 10;
  }

  // ── Compliance Statement ────────────────────────────────────────────────
  checkPage(30);
  addText('COMPLIANCE STATEMENT', 20, y, { size: 8, color: GREY, style: 'bold' });
  y += 8;

  const complianceText = audio.percent >= 80
    ? `${institutionName} meets the DOJ's 2024 digital accessibility mandate with ${audio.percent}% audio description coverage across ${artworks.length} artworks. The institution uses Gestalt's AI-powered platform for on-device visual recognition (CLIP ViT-B/32), neural text-to-speech audio descriptions, and zero-infrastructure deployment.`
    : `${institutionName} is working toward full compliance with the DOJ's 2024 digital accessibility mandate. Current audio description coverage is ${audio.percent}% across ${artworks.length} artworks. ${audioCounts.missing} artworks require audio descriptions to reach full coverage. The institution uses Gestalt's AI-powered platform to accelerate accessibility content generation.`;

  addText(complianceText, 20, y, { size: 9, color: DARK, maxWidth: W - 40 });
  y += 24;

  // ── Footer ──────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addText(`${institutionName}  ·  ${reportLabel}  ·  ${period}`, 20, 285, { size: 7, color: GREY });
    addText(`Page ${i} of ${pageCount}`, W - 40, 285, { size: 7, color: GREY });
    // Bottom green line
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.5);
    doc.line(20, 282, W - 20, 282);
  }

  // ── Save ────────────────────────────────────────────────────────────────
  const filename = `${reportType}-${period.replace(/\s+/g, '-').toLowerCase()}-${institutionName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(filename);
}
