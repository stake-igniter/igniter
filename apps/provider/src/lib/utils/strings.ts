function interpolateRecordValues(data: Record<string, string>, target: string): string {
  return Object.entries(data).reduce((output, [key, value]) => {
      return output.replace(`{${key}}`, value);
  }, target);
}
