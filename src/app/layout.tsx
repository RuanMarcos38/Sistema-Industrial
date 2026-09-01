import type { Metadata } from "next";
import { Inter,Manrope } from "next/font/google";
import "./globals.css";
const inter=Inter({subsets:["latin"],variable:"--font-body"});const manrope=Manrope({subsets:["latin"],variable:"--font-display"});
export const metadata:Metadata={title:"Sistema Industrial OS",description:"SaaS corporativo multiempresa para operação, gestão e performance"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body className={`${inter.variable} ${manrope.variable}`}>{children}</body></html>}
