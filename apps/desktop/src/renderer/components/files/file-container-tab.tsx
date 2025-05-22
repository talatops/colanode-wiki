import { FileThumbnail } from '@/renderer/components/files/file-thumbnail';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useQuery } from '@/renderer/hooks/use-query';
import { LocalFileNode } from '@/shared/types/nodes';

interface FileContainerTabProps {
  fileId: string;
}

export const FileContainerTab = ({ fileId }: FileContainerTabProps) => {
  const workspace = useWorkspace();

  const { data, isPending } = useQuery({
    type: 'node_get',
    nodeId: fileId,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const file = data as LocalFileNode;
  if (!file) {
    return <p className="text-sm text-muted-foreground">Not found</p>;
  }

  return (
    <div className="flex items-center space-x-2">
      <FileThumbnail file={file} className="size-4 rounded object-contain" />
      <span>{file.attributes.name}</span>
    </div>
  );
};
