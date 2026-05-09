export type NumpadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "." | "⌫";

export function handleNumpadInput(current: string, key: NumpadKey): string {
  if (key === "⌫") {
    return current.slice(0, -1);
  }

  if (key === "0" && current === "") {
    return "0";
  }

  if (key === ".") {
    if (current === "") return "0.";
    if (current.includes(".")) return current;
    return `${current}.`;
  }

  if (current.includes(".")) {
    const [, decimals] = current.split(".");
    if (decimals.length >= 2) return current;
  }

  let newValue = `${current}${key}`;
  if (!newValue.includes(".")) {
    const num = parseInt(newValue, 10);
    if (num === 0 && newValue.length > 1) {
      newValue = newValue.replace(/^0+/, "");
    }
  }

  return newValue || "0";
}

export function backspaceNumpadInput(current: string): string {
  return handleNumpadInput(current, "⌫");
}
