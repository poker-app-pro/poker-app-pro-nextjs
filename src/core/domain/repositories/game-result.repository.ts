export interface GameResultRepository {
  save(result: Record<string, unknown>): Promise<Record<string, unknown>>;
}
