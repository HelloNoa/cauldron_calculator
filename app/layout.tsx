import type { Metadata } from "next";
import "./globals.css";
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
export const metadata: Metadata = {
  ...(isGitHubPages ? { metadataBase: new URL("https://hellonoa.github.io/cauldron_calculator/") } : {}),
  title: "+10 가마솥 교환 계산기",
  description: "강화도별 제작 재료를 혼합해 교환 가능한 +10 가마솥 수량을 계산합니다.",
  openGraph: { title: "+10 가마솥 교환 계산기", description: "강화도 혼합 · 첫 거래 할인 · 교환 가능 수량", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "+10 가마솥 교환 계산기", description: "강화도 혼합 · 첫 거래 할인 · 교환 가능 수량", images: ["/og.png"] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
