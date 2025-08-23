import { expect, test, describe, it } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { POST } from '../../../src/app/api/menus/upload/route';
import fs from 'fs';
import path from 'path';

describe('Menu Upload API', () => {
  // Helper to create a mock NextRequest with formData containing a file
  async function createRequestWithFile(filePath: string, mimeType: string) {
    const fileBuffer = fs.readFileSync(filePath);
    // @ts-ignore
    const file = new File([fileBuffer], path.basename(filePath), { type: mimeType });
    const formData = new FormData();
    formData.append('file', file);
    const { req, res } = createMocks({
      method: 'POST',
    });
    // Mock formData method on req
    req.formData = async () => formData;
    return { req, res };
  }

  it('returns error if no file provided', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    req.formData = async () => new FormData(); // empty formData
    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('No file provided');
  });

  it('processes PDF file and returns extracted items', async () => {
    const pdfPath = path.resolve(__dirname, '../fixtures/sample-menu.pdf');
    const { req, res } = await createRequestWithFile(pdfPath, 'application/pdf');
    const response = await POST(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json.items)).toBe(true);
  });

  it('processes DOCX file and returns extracted items', async () => {
    const docxPath = path.resolve(__dirname, '../fixtures/sample-menu.docx');
    const { req, res } = await createRequestWithFile(docxPath, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const response = await POST(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json.items)).toBe(true);
  });

  it('processes image file and returns extracted items', async () => {
    const imgPath = path.resolve(__dirname, '../fixtures/sample-menu.jpg');
    const { req, res } = await createRequestWithFile(imgPath, 'image/jpeg');
    const response = await POST(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json.items)).toBe(true);
  });

  it('returns fallback data on unsupported file type', async () => {
    const txtPath = path.resolve(__dirname, '../fixtures/sample-menu.txt');
    const { req, res } = await createRequestWithFile(txtPath, 'text/plain');
    const response = await POST(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.items).toBeDefined();
    expect(json.items.length).toBeGreaterThan(0);
  });
});
