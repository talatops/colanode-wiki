import { appService } from '@/main/services/app-service';
import { WorkspaceService } from '@/main/services/workspaces/workspace-service';
import { QueryError, QueryErrorCode } from '@/shared/queries';

export abstract class WorkspaceQueryHandlerBase {
  protected getWorkspace(
    accountId: string,
    workspaceId: string
  ): WorkspaceService {
    const account = appService.getAccount(accountId);
    if (!account) {
      throw new QueryError(
        QueryErrorCode.AccountNotFound,
        'Account not found or has been logged out already. Try closing the app and opening it again.'
      );
    }

    const workspace = account.getWorkspace(workspaceId);
    if (!workspace) {
      throw new QueryError(
        QueryErrorCode.WorkspaceNotFound,
        'Workspace not found or has been deleted.'
      );
    }

    return workspace;
  }
}
