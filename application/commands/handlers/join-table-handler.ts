import { CommandHandler } from "../command-bus"
import { JoinTableCommand } from "../join-table-command"
import { TableMembershipWriter } from "../ports"

export class JoinTableHandler
  implements CommandHandler<JoinTableCommand, { joined: boolean }>
{
  constructor(private readonly membershipWriter: TableMembershipWriter) {}

  async handle(command: JoinTableCommand): Promise<{ joined: boolean }> {
    const table = await this.membershipWriter.addPlayer(
      command.payload.tableId,
      command.payload.playerId
    )

    if (!table) {
      return { joined: false }
    }

    return { joined: true }
  }
}
