import { useState, useEffect, useCallback } from 'react';
import { useFlowStore } from '@/store';
import { useWorkspaceDocumentActions } from '@/store/documentHooks';

export interface UseWorkspaceDocumentReturn {
  activeDocument: ReturnType<typeof useFlowStore.getState>['documents'][number] | undefined;
  docName: string;
  isEditingDocName: boolean;
  docNameInput: string;
  startEditDocName: () => void;
  setDocNameInput: (value: string) => void;
  saveDocName: () => void;
  cancelEditDocName: () => void;
}

/**
 * Shared hook for document name display + inline editing.
 * Extracted from Design/Slides/Make/Buzz/Site workspaces.
 *
 * Pattern:
 *  - activeDocument from store
 *  - local edit state (isEditingDocName, docNameInput)
 *  - saveDocName commits rename if input is non-empty
 */
export function useWorkspaceDocument(): UseWorkspaceDocumentReturn {
  const activeDocument = useFlowStore((state) =>
    state.documents.find((d) => d.id === state.activeDocumentId)
  );
  const docName = activeDocument?.name || 'Untitled';
  const { renameDocument } = useWorkspaceDocumentActions();

  const [isEditingDocName, setIsEditingDocName] = useState(false);
  const [docNameInput, setDocNameInput] = useState(docName);

  useEffect(() => {
    setDocNameInput(docName);
  }, [docName]);

  const startEditDocName = useCallback(() => {
    setDocNameInput(docName);
    setIsEditingDocName(true);
  }, [docName]);

  const saveDocName = useCallback(() => {
    setIsEditingDocName(false);
    if (activeDocument && docNameInput.trim()) {
      renameDocument(activeDocument.id, docNameInput.trim());
    }
  }, [activeDocument, docNameInput, renameDocument]);

  const cancelEditDocName = useCallback(() => {
    setIsEditingDocName(false);
    setDocNameInput(docName);
  }, [docName]);

  return {
    activeDocument,
    docName,
    isEditingDocName,
    docNameInput,
    startEditDocName,
    setDocNameInput,
    saveDocName,
    cancelEditDocName,
  };
}
