import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const DOCUMENTS_DIR = path.join(__dirname, '../src/rag/documents');

async function readTxtOrMd(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

async function readPdf(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  const pdfData = await pdfParse(data);
  return pdfData.text;
}

async function readDocx(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer: data });
  return result.value;
}

function makeIdFromFilename(filename: string) {
  return filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function ingest() {
  const files = await fs.readdir(DOCUMENTS_DIR);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.json') continue; // skip existing JSON
    let content = '';
    try {
      if (ext === '.txt' || ext === '.md') {
        content = await readTxtOrMd(path.join(DOCUMENTS_DIR, file));
      } else if (ext === '.pdf') {
        content = await readPdf(path.join(DOCUMENTS_DIR, file));
      } else if (ext === '.docx') {
        content = await readDocx(path.join(DOCUMENTS_DIR, file));
      } else {
        console.log(`Skipping unsupported file: ${file}`);
        continue;
      }
      const json = {
        id: makeIdFromFilename(file),
        title: file,
        content: content.trim(),
        metadata: {
          source: file,
          type: ext === '.pdf' ? 'pdf' : ext === '.md' ? 'markdown' : ext === '.docx' ? 'docx' : 'text',
          date: new Date().toISOString(),
          tags: [],
        },
      };
      const outFile = path.join(DOCUMENTS_DIR, `${makeIdFromFilename(file)}.json`);
      await fs.writeFile(outFile, JSON.stringify(json, null, 2));
      console.log(`Ingested ${file} -> ${outFile}`);
    } catch (e) {
      console.error(`Failed to ingest ${file}:`, e);
    }
  }
}

ingest(); 