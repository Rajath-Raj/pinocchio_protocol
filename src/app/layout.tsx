import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Literata, Space_Grotesk, Source_Code_Pro } from 'next/font/google';

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  display: 'swap',
});


export const metadata: Metadata = {
  title: 'Obfuscate',
  description: 'Technically true, maximally confusing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${literata.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
