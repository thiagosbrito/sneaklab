export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="w-screen h-screen bg-gradient-to-b from-background to-foreground text-foreground">
        {children}
      </body>
    </html>
  );
}