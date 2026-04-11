export interface PlayerRepository {
  findByNameTerm(term: string): Promise<string[]>;
}
