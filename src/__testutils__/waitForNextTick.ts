export default function waitForNextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 20));
}
