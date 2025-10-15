"use client";
import React from "react";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface HeaderProps {
  title: string;
  subtitle?: string;
  haveActionButtons?: boolean;
  actionButtons?: React.ReactNode[];
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  haveActionButtons = false,
  actionButtons = [],
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg relative">
      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>

      <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h1
              className={`${roboto.className} text-3xl sm:text-4xl font-bold text-white tracking-tight`}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className={`${roboto.className} text-sm sm:text-base text-blue-50 max-w-3xl`}
              >
                {subtitle}
              </p>
            )}
          </div>

          {haveActionButtons && actionButtons && actionButtons.length > 0 && (
            <div className="flex flex-wrap gap-3 items-start flex-start">
              {actionButtons.map((button, index) => (
                <React.Fragment key={index}>{button}</React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
