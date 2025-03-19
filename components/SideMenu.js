import React from "react";
import Link from "next/link";

export default function SideMenu() {
  return (
    <nav>
      <ul>
        <li><Link href="/">Tree</Link></li>
        <li><Link href="/">
          <a>Home</a>
        </Link></li>
        <li><Link href="/chat">Chat</Link></li>
      </ul>
    </nav>
  );
}
