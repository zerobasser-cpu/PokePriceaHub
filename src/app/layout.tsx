import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PokePrices — Pokémon Card Prices",
    template: "%s | PokePrices"
  },
  description:
    "Search Pokémon cards, sets, rarities and types. Compare Pokémon card prices from multiple sources.",
  keywords: [
    "Pokemon card prices",
    "Pokemon cards",
    "Pokemon TCG",
    "Pokemon card value",
    "TCG prices",
    "Cardmarket",
    "TCGplayer"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}