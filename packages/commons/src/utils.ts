export const parseEnvInt = function (value: string | undefined, fallback: number): number {
  const parsed = parseInt(value || '')
  return Number.isFinite(parsed) ? parsed : fallback
}

export const checkEnvVariables = (vars: string[]) => {
  for (const v of vars) {
    if (!process.env[v]) {
      throw new Error(`Missing required env variable: ${v}`)
    }
  }
}
