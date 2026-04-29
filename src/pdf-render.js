export function drawPdf(spec, JsPdfCtor) {
  const pdf = new JsPdfCtor({ unit: 'pt', format: spec.pageSize });
  spec.pages.forEach((page, i) => {
    if (i > 0) pdf.addPage();
    if (i === 0) {
      pdf.setFontSize(18);
      pdf.text(spec.title, 40, 50);
    }
    if (page.kind === 'grid') drawGridPage(pdf, page);
    else if (page.kind === 'legend') drawLegendPage(pdf, page);
  });
  return pdf.output('blob');
}

function drawGridPage(pdf, page) {
  pdf.setFontSize(10);
  pdf.text(`Grid ${page.size.cols}×${page.size.rows}`, 40, 80);
}

function drawLegendPage(pdf, page) {
  pdf.setFontSize(10);
  page.entries.forEach((e, idx) => {
    pdf.text(`${e.code}  ${e.hex}  ×${e.count}`, 40, 60 + idx * 14);
  });
}
