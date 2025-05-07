import React from "react";
import { Link } from "wouter";

export const Logo: React.FC = () => {
  return (
    <Link href="/">
      <img src="/logo.webp" alt="A Brighter Day.Life Logo" className="h-[34px] w-11" />
    </Link>
  );
};
