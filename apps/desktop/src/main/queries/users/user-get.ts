import { WorkspaceQueryHandlerBase } from '@/main/queries/workspace-query-handler-base';
import { ChangeCheckResult, QueryHandler } from '@/main/lib/types';
import { mapUser } from '@/main/lib/mappers';
import { UserGetQueryInput } from '@/shared/queries/users/user-get';
import { Event } from '@/shared/types/events';
import { User } from '@/shared/types/users';
import { SelectUser } from '@/main/databases/workspace';

export class UserGetQueryHandler
  extends WorkspaceQueryHandlerBase
  implements QueryHandler<UserGetQueryInput>
{
  public async handleQuery(input: UserGetQueryInput): Promise<User | null> {
    const row = await this.fetchUser(input);
    return row ? mapUser(row) : null;
  }

  public async checkForChanges(
    event: Event,
    input: UserGetQueryInput,
    _: User | null
  ): Promise<ChangeCheckResult<UserGetQueryInput>> {
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
      event.type === 'user_created' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.user.id === input.userId
    ) {
      return {
        hasChanges: true,
        result: event.user,
      };
    }

    if (
      event.type === 'user_updated' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.user.id === input.userId
    ) {
      return {
        hasChanges: true,
        result: event.user,
      };
    }

    if (
      event.type === 'user_deleted' &&
      event.accountId === input.accountId &&
      event.workspaceId === input.workspaceId &&
      event.user.id === input.userId
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

  private async fetchUser(
    input: UserGetQueryInput
  ): Promise<SelectUser | undefined> {
    const workspace = this.getWorkspace(input.accountId, input.workspaceId);

    const row = await workspace.database
      .selectFrom('users')
      .selectAll()
      .where('id', '=', input.userId)
      .executeTakeFirst();

    return row;
  }
}
