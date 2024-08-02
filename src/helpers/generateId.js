export function generateRandomNumericId() {
  // Generar un número aleatorio entre 0 y 9999999999
  const randomId = Math.floor(Math.random() * 10000000000);
  return randomId;
}
