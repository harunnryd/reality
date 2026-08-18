import { invoke } from "@tauri-apps/api/core";

export interface DocumentExtractionResult {
  file_name: string;
  extension: string;
  size_bytes: number;
  text_content: string;
  is_truncated: boolean;
}

export const documentService = {
  async extractDocumentText(path: string): Promise<DocumentExtractionResult> {
    return await invoke<DocumentExtractionResult>("extract_document_text", { path });
  },
};
