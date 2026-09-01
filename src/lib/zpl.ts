const clean = (value: string) => value.replace(/[\^~]/g, " ").slice(0, 120);

export type LabelType = "product" | "shipping" | "pallet" | "location" | "volume";

export function generateZpl(input: {
  type: LabelType;
  code: string;
  description?: string;
  secondary?: string;
  quantity?: number;
}) {
  const code = clean(input.code);
  const description = clean(input.description ?? "");
  const secondary = clean(input.secondary ?? "");
  const quantity = Math.max(1, Math.min(10000, input.quantity ?? 1));

  const header: Record<LabelType, string> = {
    product: "PRODUTO",
    shipping: "EXPEDICAO",
    pallet: "PALETE / SSCC",
    location: "ENDERECO WMS",
    volume: "VOLUME",
  };

  const zpl = [
    "^XA",
    "^CI28",
    "^PW812",
    "^LL1218",
    `^FO40,35^A0N,32,32^FD${header[input.type]}^FS`,
    `^FO40,85^A0N,48,48^FD${code}^FS`,
    `^FO40,155^A0N,28,28^FD${description}^FS`,
    `^FO40,205^A0N,24,24^FD${secondary}^FS`,
    "^FO40,270^BY3,2,120",
    `^BCN,120,Y,N,N^FD${code}^FS`,
    `^FO40,455^A0N,28,28^FDQTD: ${quantity}^FS`,
    "^FO40,515^GB730,2,2^FS",
    "^FO40,545^A0N,22,22^FDSistema Industrial OS^FS",
    "^XZ",
  ].join("\n");

  return { zpl, quantity, type: input.type, code };
}
