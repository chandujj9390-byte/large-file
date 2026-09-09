import './globals.css';

export const metadata = {
  title: 'ARNE WORKS — Cinematic Visual Studio',
  description: 'High-end video editing, color grading, VFX, and creative production services.',
  verification: {
    google: '8tz13PPnFQFPUmgGHH1iUfHGxk0fAqbWeET0MNgCmR4',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#060907] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
