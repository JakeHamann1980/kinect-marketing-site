import { render, screen, fireEvent } from "@testing-library/react";
import { Faq } from "./Faq";

const items = [
  { question: "Q1", answer: "A1" },
  { question: "Q2", answer: "A2" },
];

it("renders all questions with collapsed answers", () => {
  render(<Faq items={items} />);
  expect(screen.getByRole("button", { name: /Q1/ })).toBeDefined();
  expect(screen.queryByText("A1")).toBeNull();
});

it("opens one answer at a time", () => {
  render(<Faq items={items} />);
  fireEvent.click(screen.getByRole("button", { name: /Q1/ }));
  expect(screen.getByText("A1")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: /Q2/ }));
  expect(screen.queryByText("A1")).toBeNull();
  expect(screen.getByText("A2")).toBeDefined();
});

it("clicking the open question closes it", () => {
  render(<Faq items={items} />);
  const q1 = screen.getByRole("button", { name: /Q1/ });
  fireEvent.click(q1);
  fireEvent.click(q1);
  expect(screen.queryByText("A1")).toBeNull();
});

it("buttons expose aria-expanded", () => {
  render(<Faq items={items} />);
  const q1 = screen.getByRole("button", { name: /Q1/ });
  expect(q1.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(q1);
  expect(q1.getAttribute("aria-expanded")).toBe("true");
});
