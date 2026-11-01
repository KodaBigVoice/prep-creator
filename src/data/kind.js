// Which creator this page is: the Prep creator (prep.html) or the Worksheet creator (worksheet.html).
// Both run the same engine and share one store; a prep or preset carries `kind: 'worksheet'` when it belongs to the worksheet creator.
export const KIND = (typeof window !== 'undefined' && window.PMU_KIND === 'worksheet') ? 'worksheet' : 'prep';
export const isWs = KIND === 'worksheet';
export const kindOf = (x) => (x && x.kind === 'worksheet' ? 'worksheet' : 'prep');
export const slotKey = (kind) => (kind === 'worksheet' ? 'currentWorksheet' : 'current');       // where each creator keeps the work on screen
export const layoutKeyOf = (kind) => (kind === 'worksheet' ? 'layoutW' : 'layout');
export const curKey = slotKey(KIND), layoutKey = layoutKeyOf(KIND);
export const PAGE = { prep: 'prep.html', worksheet: 'worksheet.html' };
export const LABEL = { prep: 'Prep creator', worksheet: 'Worksheet creator' };
export const tagKind = (prep, kind = KIND) => { if (kind === 'worksheet') prep.kind = 'worksheet'; else delete prep.kind; return prep; };
