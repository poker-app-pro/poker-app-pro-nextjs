export interface Command<Result = unknown> {
  readonly name: string
}

export interface CommandHandler<TCommand extends Command<Result>, Result> {
  handle(command: TCommand): Promise<Result> | Result
}

export class CommandBus {
  private handlers: Map<string, CommandHandler<Command, unknown>> = new Map()

  register<TCommand extends Command<Result>, Result>(
    commandName: TCommand["name"],
    handler: CommandHandler<TCommand, Result>
  ) {
    this.handlers.set(commandName, handler as CommandHandler<Command, unknown>)
  }

  async execute<TCommand extends Command<Result>, Result>(
    command: TCommand
  ): Promise<Result> {
    const handler = this.handlers.get(command.name)

    if (!handler) {
      throw new Error(`No command handler registered for ${command.name}`)
    }

    const result = await handler.handle(command)
    return result as Result
  }
}
