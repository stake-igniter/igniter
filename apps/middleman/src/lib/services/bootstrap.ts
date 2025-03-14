export async function bootstrapStatus() {
  try {
    const response = await fetch(`${process.env.AUTH_URL}/api/bootstrap`);
    const data = await response.json();
    return data.isBootstrapped;
  } catch (error) {
    console.error("Failed to fetch bootstrap status:", error);
    return false;
  }
}
