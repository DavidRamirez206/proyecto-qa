"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetch, Product, ValidationErrors } from "@/lib/api";
import { formatPrice } from "@/lib/formatPrice";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const loadProducts = useCallback(async () => {
    const response = await apiFetch("/api/products");

    if (response.status === 401) {
      router.push("/login");
      return;
    }

    setProducts((await response.json()) as Product[]);
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void loadProducts();
  }, [loadProducts]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const response = await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify({ name, price }),
    });

    if (response.status === 422) {
      const body = (await response.json()) as { errors: ValidationErrors };
      setErrors(body.errors);
      return;
    }

    if (response.status === 401) {
      router.push("/login");
      return;
    }

    setName("");
    setPrice("");
    await loadProducts();
  }

  return (
    <main>
      <h1>Productos</h1>

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} — {formatPrice(Number(product.price))}
          </li>
        ))}
      </ul>

      <h2>Nuevo producto</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">
          Nombre
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        {errors.name && <p className="error">{errors.name[0]}</p>}

        <label htmlFor="price">
          Precio
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        {errors.price && <p className="error">{errors.price[0]}</p>}

        <button type="submit">Guardar</button>
      </form>
    </main>
  );
}
