export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const fr = new FileReader();

      fr.onload = (event) => {
        const target = event.target;
        if (target && target.result != null) {
          resolve(target.result.toString());
        } else {
          reject(new Error("FileReader failed: target or result is null"));
        }
      };

      fr.readAsText(file);
    } catch (e) {
      reject(e);
    }
  });
};
