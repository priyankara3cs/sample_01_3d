import "./globals.css";
import Navbar from "@/components/ui/Navbar.jsx";
import ClientProviders from "./ClientProviders";

export const metadata = {
  title: "Chitra Lane Welfare Society",
  description: "For children with special needs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <Navbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
