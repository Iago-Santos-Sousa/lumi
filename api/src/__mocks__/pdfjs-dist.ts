/**
 * Mock manual do pdfjs-dist para uso nos testes unitários.
 * Impede que o arquivo ESM real (que usa import.meta) seja carregado pelo Jest.
 */

export const GlobalWorkerOptions = { workerSrc: "" };

export const getDocument = jest.fn().mockReturnValue({
  promise: Promise.resolve({
    numPages: 1,
    getPage: jest.fn().mockResolvedValue({
      getTextContent: jest.fn().mockResolvedValue({
        items: [{ str: "texto mockado" }],
      }),
    }),
  }),
});
