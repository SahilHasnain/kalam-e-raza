import type { SQLiteDatabase } from "expo-sqlite";
import type { BlockRow, Book, SearchResult, SectionInfo, TocEntry } from "./types";

export const DB_NAME = "sharahe-kalaame-raza.db";

export async function initSharahDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL;");
}

export async function getBook(db: SQLiteDatabase): Promise<Book | null> {
  return db.getFirstAsync<Book>(
    `SELECT
       id,
       slug,
       title,
       author,
       language,
       source_file AS sourceFile,
       schema_version AS schemaVersion,
       page_count AS pageCount,
       front_matter_pdf_pages AS frontMatterPdfPages,
       extracted_at AS extractedAt
     FROM book
     LIMIT 1`,
  );
}

export async function getToc(db: SQLiteDatabase): Promise<TocEntry[]> {
  return db.getAllAsync<TocEntry>(
    `SELECT
       t.section_no AS sectionNo,
       t.title,
       t.printed_page AS printedPage,
       t.pdf_page AS pdfPage,
       (SELECT COUNT(*) FROM block b JOIN section s ON s.id = b.section_id WHERE s.section_no = t.section_no) AS blockCount
     FROM toc t
     ORDER BY t.section_no`,
  );
}

export async function getSectionInfo(db: SQLiteDatabase, sectionNo: number): Promise<SectionInfo | null> {
  return db.getFirstAsync<SectionInfo>(
    `SELECT
       section_no AS sectionNo,
       title,
       start_printed_page AS startPrintedPage,
       end_printed_page AS endPrintedPage
     FROM section
     WHERE section_no = ?`,
    [sectionNo],
  );
}

export async function getBlocksBySectionNo(db: SQLiteDatabase, sectionNo: number): Promise<BlockRow[]> {
  return db.getAllAsync<BlockRow>(
    `SELECT
       b.id,
       s.section_no AS sectionNo,
       b.sequence_no AS sequenceNo,
       b.block_type AS blockType,
       b.pdf_page AS pdfPage,
       b.printed_page AS printedPage,
       b.text
     FROM block b
     JOIN section s ON s.id = b.section_id
     WHERE s.section_no = ?
     ORDER BY b.sequence_no`,
    [sectionNo],
  );
}

function sanitizeSearchTerm(term: string): string {
  return term.replace(/["']/g, "");
}

export function buildFtsQuery(query: string): string {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `"${sanitizeSearchTerm(term)}"*`)
    .join(" ");
}

export async function searchSharah(db: SQLiteDatabase, query: string): Promise<SearchResult[]> {
  const match = buildFtsQuery(query);
  if (!match) return [];
  return db.getAllAsync<SearchResult>(
    `SELECT
       b.id AS blockId,
       s.section_no AS sectionNo,
       b.block_type AS blockType,
       b.text,
       snippet(block_fts, 0, '[', ']', '...', 10) AS snippet
     FROM block_fts f
     JOIN block b ON b.rowid = f.rowid
     JOIN section s ON s.id = b.section_id
     WHERE block_fts MATCH ?
     ORDER BY b.section_id, b.sequence_no
     LIMIT 60`,
    [match],
  );
}