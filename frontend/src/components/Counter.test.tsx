import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

describe("Counter", () => {
  it("muestra el valor inicial", () => {
    render(<Counter />);
    expect(screen.getByText("Valor: 0")).toBeInTheDocument();
  });

  it("aumenta el valor al hacer clic en Incrementar", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "Incrementar" }));
    await user.click(screen.getByRole("button", { name: "Incrementar" }));

    expect(screen.getByText("Valor: 2")).toBeInTheDocument();
  });
});
