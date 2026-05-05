import type { Messages } from './index';

export const en: Messages = {
  site: {
    title: 'Handwritten Number Calendar Maker',
    description:
      "Create a one-of-a-kind calendar using your child's photos and handwritten numbers — all in your browser.",
  },
  header: {
    autosave:
      "Your edits are auto-saved in this browser. They won't carry over to other devices or browsers.",
    sampleCaption: 'Here is an example of the output',
  },
  footer: {
    madeBy: 'Made by',
  },
  clearAll: {
    button: 'Clear all',
    confirm: 'This will clear all your edits. Are you sure?',
  },
  steps: {
    step1: {
      title: 'Choose start month',
      description: 'Creates a 12-month calendar starting from the selected month.',
    },
    step2: {
      title: 'Upload monthly photos',
      description: "Click or drag & drop into each month's box to set a photo.",
    },
    step3: {
      title: 'Use handwritten digits (optional)',
      description:
        'Upload photos of digits 0–9 written by your child. Dates that can be formed from those digits will switch to handwritten style (e.g. uploading "1" and "5" switches 1, 5, 11, 15… to handwritten). Dates with missing digits will stay in the default font.',
    },
    step4: { title: 'Choose layout' },
    step5: { title: 'Preview' },
    step6: {
      title: 'Export',
      paperLabel: 'Paper',
      pdfNote: '※ All 12 months fit into a single PDF file.',
    },
  },
  startMonth: {
    startYearLabel: 'Start year',
    startMonthLabel: 'Start month',
    yearOption: (y) => `${y}`,
    monthOption: (m) =>
      new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2024, m - 1)),
    rangeInfo: (sy, sm, ey, em) => {
      const fmt = (y: number, m: number) =>
        new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
          new Date(y, m - 1),
        );
      return `Creates a 12-month calendar from ${fmt(sy, sm)} to ${fmt(ey, em)}.`;
    },
  },
  photoUploader: {
    adjustRange: 'Adjust',
    processing: 'Processing...',
    selectPhoto: 'Select photo',
    adjustButton: 'Adjust',
    replace: 'Replace',
    clear: 'Clear',
    errorLoad: 'Could not load the photo. Please try a different image.',
    monthLabel: (year, month) =>
      new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
        new Date(year, month - 1),
      ),
  },
  digitUploader: {
    hint: 'Take a photo of digits 0–9 written with a marker on white paper and upload them. The white background will be removed automatically.',
    processing: 'Processing...',
    photo: 'Photo',
    clear: 'Remove',
    errorLoad: 'Could not load the image. Please try a different one.',
  },
  export: {
    pdfButton: 'Export PDF (12 months)',
    pngButton: 'Download as PNG',
    exporting: (current, total) => `Exporting ${current} / ${total}`,
    errorPdf: 'PDF export failed. Please try again.',
    errorPng: 'PNG export failed. Please try again.',
    printHint: {
      title: 'Print settings',
      paperA4: 'Paper: A4 / Scale: 100% (actual size)',
      twoUp: '2 months per A4 sheet, stacked vertically (6 sheets total)',
      cropAfterPrint: 'After printing, cut along the crop marks at the corners of each card',
      paperExact: 'Paper: same size as the PDF / Scale: 100% (actual size)',
      clipMargin: (mm, side) => `~${mm}mm margin on the ${side} edge for clip/stand attachment`,
      doubleSided: 'Double-sided printing: long-edge binding',
      bindTop: 'After printing, bind the top edge (hole punch + string / clip, etc.)',
      flipInstruction: 'Flip from the bottom — the next month appears right-side up on the back',
    },
  },
  paperSize: {
    a4Label: 'Print on A4 (recommended)',
    a4Description:
      'Print on a home printer or convenience store printer. Cut along the crop marks after printing.',
    exactLabel: 'Print on exact-size paper',
    exactDescription:
      'Use paper the same size as the calendar. Suited for professional printing.',
  },
  layout: {
    wall: 'Wall (12.7×25.4cm)',
    deskHorizontal: 'Desk horizontal (14.4×8.6cm)',
  },
  calendar: {
    noPhoto: 'No photo',
  },
  notFound: {
    title: 'Page not found',
    description: "The page you're looking for doesn't exist or has been removed.",
    backToTop: 'Back to top',
  },
  error: {
    title: 'Something went wrong',
    description: 'An error occurred while loading the page. Please try again.',
    errorId: (digest) => `Error ID: ${digest}`,
    retry: 'Retry',
  },
};
