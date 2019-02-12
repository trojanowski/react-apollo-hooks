export default function wait(): Promise<void> {
  return new Promise(resolve => {
    return setTimeout(resolve, 10);
  });
}
