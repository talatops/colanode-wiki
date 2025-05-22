import { sql } from 'kysely';

import { ChangeCheckResult, QueryHandler } from '@/main/lib/types';
import { mapNode } from '@/main/lib/mappers';
import { RecordSearchQueryInput } from '@/shared/queries/records/record-search';
import { Event } from '@/shared/types/events';
import { SelectNode } from '@/main/databases/workspace';
import { WorkspaceQueryHandlerBase } from '@/main/queries/workspace-query-handler-base';
import { LocalRecordNode } from '@/shared/types/nodes';

export class RecordSearchQueryHandler
  extends WorkspaceQueryHandlerBase
  implements QueryHandler<RecordSearchQueryInput>
{
  public async handleQuery(
    input: RecordSearchQueryInput
  ): Promise<LocalRecordNode[]> {
    const rows =
      input.searchQuery.length > 0
        ? await this.searchRecords(input)
        : await this.fetchRecords(input);

    return rows.map((row) => mapNode(row) as LocalRecordNode);
  }

  public async checkForChanges(
    event: Event,
    input: RecordSearchQueryInput,
    _: LocalRecordNode[]
  ): Promise<ChangeCheckResult<RecordSearchQueryInput>> {
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
      event.node.type === 'record' &&
      event.node.attributes.databaseId === input.databaseId
    ) {
      const newResult = await this.handleQuery(input);
      return {
        hasChanges: true,
        result: newResult,
      };
    }

    if (
      event.type === 'node_updated' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.type === 'record' &&
      event.node.attributes.databaseId === input.databaseId
    ) {
      const newResult = await this.handleQuery(input);
      return {
        hasChanges: true,
        result: newResult,
      };
    }

    if (
      event.type === 'node_deleted' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.node.type === 'record' &&
      event.node.attributes.databaseId === input.databaseId
    ) {
      const newResult = await this.handleQuery(input);
      return {
        hasChanges: true,
        result: newResult,
      };
    }

    return {
      hasChanges: false,
    };
  }

  private async searchRecords(
    input: RecordSearchQueryInput
  ): Promise<SelectNode[]> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const exclude = input.exclude ?? [];
    const query = sql<SelectNode>`
      SELECT n.*
      FROM nodes n
      JOIN node_names nn ON n.id = nn.id
      WHERE n.type = 'record'
        AND n.parent_id = ${input.databaseId}
        AND en.name MATCH ${input.searchQuery + '*'}
        ${
          exclude.length > 0
            ? sql`AND n.id NOT IN (${sql.join(
                exclude.map((id) => sql`${id}`),
                sql`, `
              )})`
            : sql``
        }
    `.compile(workspace.database);

    const result = await workspace.database.executeQuery(query);
    return result.rows;
  }

  private async fetchRecords(
    input: RecordSearchQueryInput
  ): Promise<SelectNode[]> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const exclude = input.exclude ?? [];
    return workspace.database
      .selectFrom('nodes')
      .where('type', '=', 'record')
      .where('parent_id', '=', input.databaseId)
      .where('id', 'not in', exclude)
      .selectAll()
      .execute();
  }
}
