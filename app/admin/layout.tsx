"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Users,
  Award,
  BarChart3,
  LogOut,
  Menu,
  X,
  FileCheck2,
  FolderPlus,
  KeyRound,
  FileText,
  UploadCloud,
  ChevronDown,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    // Check admin session
    fetch("/api/admin/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/admin/login");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.admin) {
          setAdminUser(data.admin);
        }
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      localStorage.removeItem("tekzow_admin_token");
      localStorage.removeItem("tekzow_admin_user");
      router.push("/admin/login");
    } catch (e) {
      router.push("/admin/login");
    }
  };

  // If on admin login page, render login page without admin dashboard sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Courses",
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      label: "Exams",
      href: "/admin/exams",
      icon: FileCheck2,
    },
    {
      label: "Question Bank",
      href: "/admin/questions",
      icon: FileQuestion,
    },
    {
      label: "Students",
      href: "/admin/students",
      icon: Users,
    },
    {
      label: "Attempts",
      href: "/admin/attempts",
      icon: FileText,
    },
    {
      label: "Certificates",
      href: "/admin/certificates",
      icon: Award,
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-20 px-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center">
            <div className="relative h-11 w-40 bg-white/95 p-1 rounded-lg">
              <Image
                src="/images/tekzow-logo.png"
                alt="Tekzow Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin User Info Pill */}
        <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
          <div className="font-bold text-slate-200">
            {adminUser?.name || "Tekzow Administrator"}
          </div>
          <div className="text-[11px] text-blue-400 font-mono">
            {adminUser?.email || "admin@tekzow.com"}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Open Student Portal ↗
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-red-300 hover:text-red-100 hover:bg-red-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Top Navbar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative h-8 w-28">
            <Image
              src="/images/tekzow-logo.png"
              alt="Tekzow Logo"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-red-600 p-1"
          >
            Logout
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
