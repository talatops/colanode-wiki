import { WorkspaceQueryHandlerBase } from '@/main/queries/workspace-query-handler-base';
import { ChangeCheckResult, QueryHandler } from '@/main/lib/types';
import { mapNode } from '@/main/lib/mappers';
import { SpaceListQueryInput } from '@/shared/queries/spaces/space-list';
import { Event } from '@/shared/types/events';
import { SelectNode } from '@/main/databases/workspace';
import { LocalSpaceNode } from '@/shared/types/nodes';

export class SpaceListQueryHandler
  extends WorkspaceQueryHandlerBase
  implements QueryHandler<SpaceListQueryInput>
{
  public async handleQuery(
    input: SpaceListQueryInput
  ): Promise<LocalSpaceNode[]> {
    const rows = await this.fetchChildren(input);
    return rows.map(mapNode) as LocalSpaceNode[];
  }

  public async checkForChanges(
    event: Event,
    input: SpaceListQueryInput,
    output: LocalSpaceNode[]
  ): Promise<ChangeCheckResult<SpaceListQueryInput>> {
    if (
      event.type === 'workspace_deleted' &&
      event.workspace.accountId === input.accountId &&
      event.workspace.id === input.workspaceId
    ) {
      return {
        hasChanges: true,
        result: [],
      };
    }

    if (
      event.type === 'node_created' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.type === 'space'
    ) {
      const newChildren = [...output, event.node];
      return {
        hasChanges: true,
        result: newChildren,
      };
    }

    if (
      event.type === 'node_updated' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.type === 'space'
    ) {
      const node = output.find((n) => n.id === event.node.id);
      if (node) {
        const newChildren = output.map((n) =>
          n.id === event.node.id ? (event.node as LocalSpaceNode) : n
        );

        return {
          hasChanges: true,
          result: newChildren,
        };
      }
    }

    if (
      event.type === 'node_deleted' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.type === 'space'
    ) {
      const node = output.find((n) => n.id === event.node.id);
      if (node) {
        const newChildren = output.filter((n) => n.id !== event.node.id);
        return {
          hasChanges: true,
          result: newChildren,
        };
      }
    }

    return {
      hasChanges: false,
    };
  }

  private async fetchChildren(
    input: SpaceListQueryInput
  ): Promise<SelectNode[]> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const rows = await workspace.database
      .selectFrom('nodes')
      .selectAll()
      .where('type', '=', 'space')
      .execute();

    return rows;
  }
}
