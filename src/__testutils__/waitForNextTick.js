export default function waitForNextTick() {
  return new Promise(resolve => setTimeout(resolve, 20));
}
