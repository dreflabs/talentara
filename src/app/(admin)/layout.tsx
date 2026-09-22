import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - TALENTARA",
  description: "Admin dashboard untuk mengelola platform TALENTARA",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
