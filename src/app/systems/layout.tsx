export default function SystemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#E4DCD1] min-h-screen">
        {children}
      </body>
    </html>
  );
}
