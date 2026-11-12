"use client";

import { useState } from "react";

export default function Counter({ initial = 0 }: { initial?: number }) {
  const [value, setValue] = useState(initial);

  return (
    <div>
      <p>Valor: {value}</p>
      <button type="button" onClick={() => setValue((v) => v + 1)}>
        Incrementar
      </button>
    </div>
  );
}
