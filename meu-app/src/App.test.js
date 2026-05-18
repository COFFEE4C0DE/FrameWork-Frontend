import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import App from "./App";

test("renders landing title", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

  const titleElement = screen.getByRole("heading", { name: /twentyone market/i });
  expect(titleElement).toBeInTheDocument();
});
