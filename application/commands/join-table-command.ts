import { Command } from "./command-bus"

export interface JoinTableCommandProps {
  tableId: string
  playerId: string
}

export class JoinTableCommand implements Command {
  static readonly commandName = "JoinTableCommand"
  readonly name = JoinTableCommand.commandName

  constructor(public readonly payload: JoinTableCommandProps) {}
}
