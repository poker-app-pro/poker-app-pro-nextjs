import { Command } from "./command-bus"

export interface CreateGameCommandProps {
  name: string
  hostId: string
  scheduledAt: string
  tableCount: number
  maxPlayersPerTable: number
}

export class CreateGameCommand implements Command {
  static readonly commandName = "CreateGameCommand"
  readonly name = CreateGameCommand.commandName

  constructor(public readonly payload: CreateGameCommandProps) {}
}
