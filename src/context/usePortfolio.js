import { useContext } from "react";
import { PortfolioContext } from "./portfolioContextDef";

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
