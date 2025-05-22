import { SelectServer } from '@/main/databases/app';
import { appService } from '@/main/services/app-service';
import { ChangeCheckResult, QueryHandler } from '@/main/lib/types';
import { ServerListQueryInput } from '@/shared/queries/servers/server-list';
import { Event } from '@/shared/types/events';
import { Server } from '@/shared/types/servers';

export class ServerListQueryHandler
  implements QueryHandler<ServerListQueryInput>
{
  async handleQuery(_: ServerListQueryInput): Promise<Server[]> {
    const rows = await this.fetchServers();
    return this.mapServers(rows);
  }

  async checkForChanges(
    event: Event,
    _: ServerListQueryInput,
    output: Server[]
  ): Promise<ChangeCheckResult<ServerListQueryInput>> {
    if (event.type === 'server_created') {
      const newServers = [...output, event.server];
      return {
        hasChanges: true,
        result: newServers,
      };
    } else if (event.type === 'server_updated') {
      const newServers = output.map((server) =>
        server.domain === event.server.domain ? event.server : server
      );
      return {
        hasChanges: true,
        result: newServers,
      };
    }

    return {
      hasChanges: false,
    };
  }

  private fetchServers(): Promise<SelectServer[]> {
    return appService.database.selectFrom('servers').selectAll().execute();
  }

  private mapServers = (rows: SelectServer[]): Server[] => {
    return rows.map((row) => {
      return {
        domain: row.domain,
        name: row.name,
        avatar: row.avatar,
        attributes: JSON.parse(row.attributes),
        version: row.version,
        createdAt: new Date(row.created_at),
        syncedAt: row.synced_at ? new Date(row.synced_at) : null,
      };
    });
  };
}
