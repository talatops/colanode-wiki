import { Avatar } from '@/renderer/components/avatars/avatar';
import { useWorkspace } from '@/renderer/contexts/workspace';
import { useQuery } from '@/renderer/hooks/use-query';
import { LocalDatabaseNode } from '@/shared/types/nodes';

interface DatabaseContainerTabProps {
  databaseId: string;
}

export const DatabaseContainerTab = ({
  databaseId,
}: DatabaseContainerTabProps) => {
  const workspace = useWorkspace();

  const { data, isPending } = useQuery({
    type: 'node_get',
    nodeId: databaseId,
    accountId: workspace.accountId,
    workspaceId: workspace.id,
  });

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const database = data as LocalDatabaseNode;
  if (!database) {
    return <p className="text-sm text-muted-foreground">Not found</p>;
  }

  const name =
    database.attributes.name && database.attributes.name.length > 0
      ? database.attributes.name
      : 'Unnamed';

  return (
    <div className="flex items-center space-x-2">
      <Avatar
        size="small"
        id={database.id}
        name={name}
        avatar={database.attributes.avatar}
      />
      <span>{name}</span>
    </div>
  );
};
