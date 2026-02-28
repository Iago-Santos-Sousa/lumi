//função para converter a imagem em base64
const blobToBase64 = (blob: Blob): Promise<string | null> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else {
        console.error("Unexpected result type:", reader.result);
        resolve(null);
        // Handle ArrayBuffer case (if needed)
      }
    };
    reader.readAsDataURL(blob);
  });
};

//função para converter base64 em imagem
const base64ToBlob = async (b64Data: string): Promise<Blob> => {
  const contentType: string = "image/jpeg";
  const sliceSize: number = 512;

  const byteCharacters = atob(b64Data);
  const byteArrays: BlobPart[] = []; // Change to BlobPart[]

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers: number[] = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export { blobToBase64, base64ToBlob };
