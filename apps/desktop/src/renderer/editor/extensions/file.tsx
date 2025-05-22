import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { FileNodeView } from '@/renderer/editor/views';
import { EditorContext } from '@/shared/types/editor';
import { toast } from '@/renderer/hooks/use-toast';

interface FileNodeOptions {
  context: EditorContext;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    file: {
      /**
       * Insert a file
       */
      addFile: (path: string) => ReturnType;
    };
  }
}

export const FileNode = Node.create<FileNodeOptions>({
  name: 'file',
  group: 'block',
  atom: true,
  defining: true,
  draggable: true,
  addAttributes() {
    return {
      id: {
        default: null,
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['file', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(FileNodeView, {
      as: 'file',
    });
  },
  addCommands() {
    const options = this.options;
    return {
      addFile: (path: string) => {
        return ({ editor, tr }) => {
          (async () => {
            const fileCreateResult = await window.colanode.executeMutation({
              type: 'file_create',
              filePath: path,
              accountId: options.context.accountId,
              workspaceId: options.context.workspaceId,
              parentId: options.context.documentId,
            });

            if (!fileCreateResult.success) {
              toast({
                variant: 'destructive',
                title: 'Failed to add file',
                description: fileCreateResult.error.message,
              });
              return;
            }

            const fileId = fileCreateResult.output.id;
            const pos = tr.selection.$head.pos;
            editor
              .chain()
              .focus()
              .insertContentAt(pos, {
                type: 'file',
                attrs: {
                  id: fileId,
                },
              })
              .run();
          })();

          return true;
        };
      },
    };
  },
  addProseMirrorPlugins() {
    const editor = this.editor;
    const options = this.options;

    if (!options.context) {
      return [];
    }

    return [
      new Plugin({
        key: new PluginKey('file-paste'),
        props: {
          handlePaste(_, event) {
            const files = Array.from(event.clipboardData?.files || []);
            if (files.length == 0) {
              return false;
            }

            (async () => {
              for (const file of files) {
                const buffer = await file.arrayBuffer();
                const fileSaveResult = await window.colanode.executeMutation({
                  type: 'file_save_temp',
                  name: file.name,
                  buffer,
                  accountId: options.context.accountId,
                  workspaceId: options.context.workspaceId,
                });

                if (!fileSaveResult.success) {
                  toast({
                    variant: 'destructive',
                    title: 'Failed to add file',
                    description: fileSaveResult.error.message,
                  });

                  return;
                }

                const path = fileSaveResult.output.path;
                editor.commands.addFile(path);
              }
            })();

            return true;
          },
        },
      }),
      new Plugin({
        key: new PluginKey('file-drop'),
        props: {
          handleDrop(_, event) {
            const files = Array.from(event.dataTransfer?.files || []);
            if (files.length == 0) {
              return false;
            }

            (async () => {
              for (const file of files) {
                const buffer = await file.arrayBuffer();
                const fileSaveResult = await window.colanode.executeMutation({
                  type: 'file_save_temp',
                  name: file.name,
                  buffer,
                  accountId: options.context.accountId,
                  workspaceId: options.context.workspaceId,
                });

                if (!fileSaveResult.success) {
                  toast({
                    variant: 'destructive',
                    title: 'Failed to add file',
                    description: fileSaveResult.error.message,
                  });

                  return;
                }

                const path = fileSaveResult.output.path;
                editor.commands.addFile(path);
              }
            })();

            return true;
          },
        },
      }),
    ];
  },
});
