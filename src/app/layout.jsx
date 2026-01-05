import "./globals.scss";

export const metadata = {
  title: "Hamza рассрочка",
  description: "Телефоны и техника в рассрочку",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}
