export interface Query<Result = unknown> {
  readonly name: string
}

export interface QueryHandler<TQuery extends Query<Result>, Result> {
  execute(query: TQuery): Promise<Result> | Result
}

export class QueryBus {
  private handlers: Map<string, QueryHandler<Query, unknown>> = new Map()

  register<TQuery extends Query<Result>, Result>(
    queryName: TQuery["name"],
    handler: QueryHandler<TQuery, Result>
  ) {
    this.handlers.set(queryName, handler as QueryHandler<Query, unknown>)
  }

  async execute<TQuery extends Query<Result>, Result>(
    query: TQuery
  ): Promise<Result> {
    const handler = this.handlers.get(query.name)

    if (!handler) {
      throw new Error(`No query handler registered for ${query.name}`)
    }

    const result = await handler.execute(query)
    return result as Result
  }
}
