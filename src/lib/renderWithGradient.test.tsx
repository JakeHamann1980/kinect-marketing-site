import { render } from "@testing-library/react";
import { renderWithGradient } from "./renderWithGradient";

/**
 * Covers the three cases the helper's own JSDoc calls out: the gradient
 * phrase splitting out of the middle of the headline (the common case, e.g.
 * home.hero.headline), the phrase sitting at the very end (e.g.
 * home.closing.headline, "Start showing it." / persona closing headlines),
 * and the phrase not being found at all (a future copy edit to one field
 * without the other), which falls back to the plain headline rather than
 * throwing. jsdom project (component test) since the helper returns JSX.
 */
it("wraps a gradient phrase in the middle of the headline", () => {
  const { container } = render(
    <>{renderWithGradient("Your best work is invisible until the data agrees.", "until the data agrees.")}</>,
  );
  const grad = container.querySelector(".kx-grad");
  expect(grad).not.toBeNull();
  expect(grad?.textContent).toBe("until the data agrees.");
  expect(container.textContent).toBe("Your best work is invisible until the data agrees.");
});

it("wraps a gradient phrase at the end of the headline", () => {
  const { container } = render(
    <>{renderWithGradient("Stop reporting on the work. Start showing it.", "Start showing it.")}</>,
  );
  const grad = container.querySelector(".kx-grad");
  expect(grad).not.toBeNull();
  expect(grad?.textContent).toBe("Start showing it.");
  expect(container.textContent).toBe("Stop reporting on the work. Start showing it.");
});

it("renders the headline plain when the phrase isn't found", () => {
  const { container } = render(
    <>{renderWithGradient("Stop reporting on the work. Start showing it.", "not in the headline")}</>,
  );
  expect(container.querySelector(".kx-grad")).toBeNull();
  expect(container.textContent).toBe("Stop reporting on the work. Start showing it.");
});
