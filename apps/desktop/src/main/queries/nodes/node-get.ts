import { SelectNode } from '@/main/databases/workspace';
import { ChangeCheckResult, QueryHandler } from '@/main/lib/types';
import { mapNode } from '@/main/lib/mappers';
import { NodeGetQueryInput } from '@/shared/queries/nodes/node-get';
import { Event } from '@/shared/types/events';
import { WorkspaceQueryHandlerBase } from '@/main/queries/workspace-query-handler-base';
import { LocalNode } from '@/shared/types/nodes';

export class NodeGetQueryHandler
  extends WorkspaceQueryHandlerBase
  implements QueryHandler<NodeGetQueryInput>
{
  public async handleQuery(
    input: NodeGetQueryInput
  ): Promise<LocalNode | null> {
    const row = await this.fetchNode(input);
    return row ? mapNode(row) : null;
  }

  public async checkForChanges(
    event: Event,
    input: NodeGetQueryInput,
    _: LocalNode | null
  ): Promise<ChangeCheckResult<NodeGetQueryInput>> {
    if (
      event.type === 'workspace_deleted' &&
      event.workspace.accountId === input.accountId &&
      event.workspace.id === input.workspaceId
    ) {
      return {
        hasChanges: true,
        result: null,
      };
    }

    if (
      event.type === 'node_created' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.nodeId
    ) {
      return {
        hasChanges: true,
        result: event.node,
      };
    }

    if (
      event.type === 'node_updated' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.nodeId
    ) {
      return {
        hasChanges: true,
        result: event.node,
      };
    }

    if (
      event.type === 'node_deleted' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.id === input.nodeId
    ) {
      return {
        hasChanges: true,
        result: null,
      };
    }

    return {
      hasChanges: false,
    };
  }

  private async fetchNode(
    input: NodeGetQueryInput
  ): Promise<SelectNode | undefined> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const row = await workspace.database
      .selectFrom('nodes')
      .selectAll()
      .where('id', '=', input.nodeId)
      .executeTakeFirst();

    return row;
  }
}
