export default function DreamLifeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#E4DCD1]">
        {children}
      </body>
    </html>
  );
}
