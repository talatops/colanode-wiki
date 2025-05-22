import { Avatar } from '@/renderer/components/avatars/avatar';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useQuery } from '@/renderer/hooks/use-query';
import { LocalFolderNode } from '@/shared/types/nodes';

interface FolderContainerTabProps {
  folderId: string;
}

export const FolderContainerTab = ({ folderId }: FolderContainerTabProps) => {
  const workspace = useWorkspace();

  const { data, isPending } = useQuery({
    type: 'node_get',
    nodeId: folderId,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const folder = data as LocalFolderNode;
  if (!folder) {
    return <p className="text-sm text-muted-foreground">Not found</p>;
  }

  const name =
    folder.attributes.name && folder.attributes.name.length > 0
      ? folder.attributes.name
      : 'Unnamed';

  return (
    <div className="flex items-center space-x-2">
      <Avatar
        size="small"
        id={folder.id}
        name={name}
        avatar={folder.attributes.avatar}
      />
      <span>{name}</span>
    </div>
  );
};
