const MARGIN_X = 40;
const TITLE_Y = 50;
const BODY_Y = 80;
const LEGEND_START_Y = 60;
const LINE_HEIGHT = 14;

export function drawPdf(spec, JsPdfCtor) {
  const pdf = new JsPdfCtor({ unit: 'pt', format: spec.pageSize });
  let titleEmitted = false;
  spec.pages.forEach((page, i) => {
    if (i > 0) pdf.addPage();
    if (page.kind === 'grid' && !titleEmitted) {
      pdf.setFontSize(18);
      pdf.text(spec.title, MARGIN_X, TITLE_Y);
      titleEmitted = true;
    }
    if (page.kind === 'grid') drawGridPage(pdf, page);
    else if (page.kind === 'legend') drawLegendPage(pdf, page);
  });
  return pdf.output('blob');
}

function drawGridPage(pdf, page) {
  pdf.setFontSize(10);
  pdf.text(`Grid ${page.size.cols}×${page.size.rows}`, MARGIN_X, BODY_Y);
}

function drawLegendPage(pdf, page) {
  pdf.setFontSize(10);
  page.entries.forEach((e, idx) => {
    pdf.text(`${e.code}  ${e.hex}  ×${e.count}`, MARGIN_X, LEGEND_START_Y + idx * LINE_HEIGHT);
  });
}
