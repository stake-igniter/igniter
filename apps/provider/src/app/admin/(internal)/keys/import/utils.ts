export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const fr = new FileReader();

      fr.onload = (event) => {
        resolve(event.target!.result!.toString());
      };

      fr.readAsText(file);
    } catch (e) {
      reject(e);
    }
  });
};
