const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("El precio debe ser un número finito");
  }

  return formatter.format(value);
}
