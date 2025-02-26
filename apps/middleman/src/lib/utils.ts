export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export function getShortAddress(address: string, length = 8) {
  return address && address.length
    ? address.slice(0, length) + "..." + address.slice(-length)
    : "";
}
