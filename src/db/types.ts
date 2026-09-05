export type Book = {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  language: string | null;
  sourceFile: string | null;
  schemaVersion: number | null;
  pageCount: number | null;
  frontMatterPdfPages: number | null;
  extractedAt: string | null;
};

export type TocEntry = {
  sectionNo: number;
  title: string;
  printedPage: number | null;
  pdfPage: number | null;
  blockCount: number;
};

export type SectionInfo = {
  sectionNo: number;
  title: string;
  startPrintedPage: number | null;
  endPrintedPage: number | null;
};

export type BlockType = "heading" | "poem" | "glossary" | "glossary_item" | "explanation";

export type BlockRow = {
  id: number;
  sectionNo: number;
  sequenceNo: number;
  blockType: BlockType;
  pdfPage: number | null;
  printedPage: number | null;
  text: string;
};

export type SearchResult = {
  blockId: number;
  sectionNo: number;
  blockType: BlockType;
  text: string;
  snippet: string;
};