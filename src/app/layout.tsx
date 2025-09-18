import type { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';

const notoSansThai = Noto_Sans_Thai({ subsets: ['thai', 'latin'] });

export const metadata: Metadata = {
  title: 'SoulFit AI - โปรแกรมสร้างโปรแกรมพิลาทิสด้วย AI',
  description: 'สร้างโปรแกรมพิลาทิสที่เหมาะกับคุณโดยการวิเคราะห์ท่าทางและประเมินสุขภาพ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={notoSansThai.className}>
        {children}
      </body>
    </html>
  );
}