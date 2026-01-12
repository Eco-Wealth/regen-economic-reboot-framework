import { useState } from "react";

export function useHubState() {
  const [currentState, setCurrentState] = useState<"dashboard" | "mentor" | "market">("dashboard");
  return { currentState, setCurrentState };
}
