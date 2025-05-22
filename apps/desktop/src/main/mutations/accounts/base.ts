import { LoginSuccessOutput } from '@colanode/core';

import { appService } from '@/main/services/app-service';
import { ServerService } from '@/main/services/server-service';
import { MutationError, MutationErrorCode } from '@/shared/mutations';
import { mapAccount, mapWorkspace } from '@/main/lib/mappers';
import { eventBus } from '@/shared/lib/event-bus';

export abstract class AccountMutationHandlerBase {
  protected async handleLoginSuccess(
    login: LoginSuccessOutput,
    server: ServerService
  ): Promise<void> {
    const createdAccount = await appService.database
      .insertInto('accounts')
      .returningAll()
      .values({
        id: login.account.id,
        email: login.account.email,
        name: login.account.name,
        server: server.domain,
        token: login.token,
        device_id: login.deviceId,
        avatar: login.account.avatar,
        created_at: new Date().toISOString(),
      })
      .executeTakeFirst();

    if (!createdAccount) {
      throw new MutationError(
        MutationErrorCode.AccountLoginFailed,
        'Account login failed, please try again.'
      );
    }

    const account = mapAccount(createdAccount);
    const accountService = await appService.initAccount(account);

    eventBus.publish({
      type: 'account_created',
      account: account,
    });

    if (login.workspaces.length === 0) {
      return;
    }

    for (const workspace of login.workspaces) {
      const createdWorkspace = await accountService.database
        .insertInto('workspaces')
        .returningAll()
        .values({
          id: workspace.id,
          name: workspace.name,
          user_id: workspace.user.id,
          account_id: account.id,
          role: workspace.user.role,
          storage_limit: workspace.user.storageLimit,
          max_file_size: workspace.user.maxFileSize,
          avatar: workspace.avatar,
          description: workspace.description,
          created_at: new Date().toISOString(),
        })
        .executeTakeFirst();

      if (!createdWorkspace) {
        continue;
      }

      await accountService.initWorkspace(mapWorkspace(createdWorkspace));
      eventBus.publish({
        type: 'workspace_created',
        workspace: mapWorkspace(createdWorkspace),
      });
    }
  }
}
