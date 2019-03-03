export default function wait(ms: number = 10): Promise<void> {
  return new Promise(resolve => {
    return setTimeout(resolve, ms);
  });
}
