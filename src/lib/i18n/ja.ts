import type { Messages } from './index';

export const ja: Messages = {
  site: {
    title: 'てがき数字カレンダーメーカー',
    description:
      '子供の写真とお子さんの手書き数字で、世界に一つだけのオリジナルカレンダーをブラウザだけで作れます。',
  },
  header: {
    autosave:
      '編集内容はこのブラウザに自動保存されます。別の端末・別のブラウザでは引き継がれません。',
    sampleCaption: '出力例はこんな感じです',
  },
  footer: {
    madeBy: 'ご要望はこちらまで',
  },
  clearAll: {
    button: '編集内容をすべてクリア',
    confirm: '編集内容をすべてクリアします。よろしいですか？',
  },
  steps: {
    step1: {
      title: '開始月を選ぶ',
      description: '開始月から12ヶ月分のカレンダーを作成します。',
    },
    step2: {
      title: '月ごとの写真をアップロード',
      description: '各月の四角をクリックまたはドラッグ&ドロップで写真を設定できます。',
    },
    step3: {
      title: '手書き数字を使う（任意）',
      description:
        'お子さんが書いた0〜9の数字写真を取り込むと、その数字で表せる日付が手書きに切り替わります（例: 「1」と「5」をアップすると 1・5・11・15… が手書きに）。足りない数字を含む日付は通常のフォントで表示されます。',
    },
    step4: { title: 'レイアウトを選ぶ' },
    step5: { title: 'プレビュー' },
    step6: {
      title: '出力',
      paperLabel: '印刷用紙',
      pdfNote: '※ PDFは12ヶ月分が1ファイルに収まります。',
    },
  },
  startMonth: {
    startYearLabel: '開始年',
    startMonthLabel: '開始月',
    yearOption: (y) => `${y}年`,
    monthOption: (m) => `${m}月`,
    rangeInfo: (sy, sm, ey, em) =>
      `${sy}年${sm}月 から ${ey}年${em}月 までの12ヶ月分のカレンダーを作ります。`,
  },
  photoUploader: {
    adjustRange: '範囲を調整',
    processing: '処理中...',
    selectPhoto: '写真を選択',
    adjustButton: '範囲調整',
    replace: '差替',
    clear: 'クリア',
    errorLoad: '写真を読み込めませんでした。別の画像でお試しください。',
    monthLabel: (year, month) => `${year}年${month}月`,
  },
  digitUploader: {
    hint: '白い紙にマジックなどで書いた0〜9の数字を撮影してアップロードしてください。白背景は自動で透過処理されます。',
    processing: '処理中...',
    photo: '写真',
    clear: '消す',
    errorLoad: '数字を読み込めませんでした。別の画像でお試しください。',
  },
  export: {
    pdfButton: 'PDFで出力（12ヶ月）',
    pngButton: 'PNGで個別ダウンロード',
    exporting: (current, total) => `書き出し中 ${current} / ${total}`,
    errorPdf: 'PDFの書き出しに失敗しました。再度お試しください。',
    errorPng: 'PNGの書き出しに失敗しました。再度お試しください。',
    printHint: {
      title: '印刷設定',
      paperA4: '用紙: A4 / 倍率: 100% (実際のサイズ・原寸大)',
      twoUp: 'A4 1 枚に 2 ヶ月分が縦並びで配置されます (計 6 枚)',
      cropAfterPrint: '印刷後、各カードの四隅のトンボ (切り取り線) に沿って切り抜く',
      paperExact: '用紙: PDF と同じサイズ / 倍率: 100% (実際のサイズ・原寸大)',
      clipMargin: (mm, side) =>
        `カード${side === 'top' ? '上' : '下'}側に約 ${mm}mm の余白あり (留め具・スタンド取付用)`,
      doubleSided: '両面印刷: 長辺とじ',
      bindTop: '印刷後、用紙の上端を綴じる (パンチ穴 + 紐 / クリップなど)',
      flipInstruction: '下端からめくると、裏面に翌月が正しい向きで現れます',
    },
  },
  paperSize: {
    a4Label: 'A4 にそのまま印刷 (推奨)',
    a4Description:
      '家庭プリンタ・コンビニ複合機で印刷。トンボ (切り取り線) に沿って後から切り抜きます。',
    exactLabel: '実寸の用紙に印刷',
    exactDescription: 'カレンダーと同じサイズの用紙を用意して印刷します。業者印刷向け。',
  },
  layout: {
    wall: '壁かけ (12.7×25.4cm)',
    deskHorizontal: '卓上 横 (14.4×8.6cm)',
  },
  calendar: {
    noPhoto: '写真未設定',
  },
  notFound: {
    title: 'ページが見つかりません',
    description: 'お探しのページは存在しないか、削除された可能性があります。',
    backToTop: 'トップに戻る',
  },
  error: {
    title: '問題が発生しました',
    description: 'ページの表示中にエラーが起きました。お手数ですが再試行してください。',
    errorId: (digest) => `エラーID: ${digest}`,
    retry: '再試行',
  },
};
