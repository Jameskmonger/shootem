export interface Renderer<TGameState> {
  render(gameState: TGameState): void;
}
