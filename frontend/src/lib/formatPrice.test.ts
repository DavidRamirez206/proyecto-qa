import { formatPrice } from "./formatPrice";

// Intl usa espacios no separables entre el símbolo y el número.
const normalizar = (texto: string) => texto.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("formatea un entero como pesos colombianos", () => {
    expect(normalizar(formatPrice(150000))).toBe("$ 150.000,00");
  });

  it("formatea decimales con coma", () => {
    expect(normalizar(formatPrice(1234.5))).toBe("$ 1.234,50");
  });

  it("formatea el cero", () => {
    expect(normalizar(formatPrice(0))).toBe("$ 0,00");
  });

  it.each([NaN, Infinity, -Infinity])("lanza un error con %s", (valor: number) => {
    expect(() => formatPrice(valor)).toThrow("El precio debe ser un número finito");
  });
});
