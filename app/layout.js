import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "Visa Excellence - Admin Panel",
  description: "Next-gen visa processing and employee management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
