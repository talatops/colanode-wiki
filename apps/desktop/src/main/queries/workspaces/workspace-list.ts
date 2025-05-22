import { SelectWorkspace } from '@/main/databases/account';
import { appService } from '@/main/services/app-service';
import { ChangeCheckResult, QueryHandler } from '@/main/lib/types';
import { mapWorkspace } from '@/main/lib/mappers';
import { WorkspaceListQueryInput } from '@/shared/queries/workspaces/workspace-list';
import { Event } from '@/shared/types/events';
import { Workspace } from '@/shared/types/workspaces';

export class WorkspaceListQueryHandler
  implements QueryHandler<WorkspaceListQueryInput>
{
  public async handleQuery(
    input: WorkspaceListQueryInput
  ): Promise<Workspace[]> {
    const rows = await this.fetchWorkspaces(input.accountId);
    return rows.map(mapWorkspace);
  }

  public async checkForChanges(
    event: Event,
    input: WorkspaceListQueryInput,
    output: Workspace[]
  ): Promise<ChangeCheckResult<WorkspaceListQueryInput>> {
    if (
      event.type === 'workspace_created' &&
      event.workspace.accountId === input.accountId
    ) {
      const newWorkspaces = [...output, event.workspace];
      return {
        hasChanges: true,
        result: newWorkspaces,
      };
    }

    if (
      event.type === 'workspace_updated' &&
      event.workspace.accountId === input.accountId
    ) {
      const updatedWorkspaces = output.map((workspace) => {
        if (workspace.id === event.workspace.id) {
          return event.workspace;
        }
        return workspace;
      });

      return {
        hasChanges: true,
        result: updatedWorkspaces,
      };
    }

    if (
      event.type === 'workspace_deleted' &&
      event.workspace.accountId === input.accountId
    ) {
      const activeWorkspaces = output.filter(
        (workspace) => workspace.id !== event.workspace.id
      );

      return {
        hasChanges: true,
        result: activeWorkspaces,
      };
    }

    return {
      hasChanges: false,
    };
  }

  private async fetchWorkspaces(accountId: string): Promise<SelectWorkspace[]> {
    const account = appService.getAccount(accountId);
    if (!account) {
      return [];
    }

    const workspaces = await account.database
      .selectFrom('workspaces')
      .selectAll()
      .execute();

    return workspaces;
  }
}
