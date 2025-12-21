"use client";

import Link from "next/link";

export default function ContactInfo() {
    return (
        <ul className="space-y-2 text-gray-700">
            <li>
                Email:{" "}
                <Link
                    href="mailto:collidedgalaxies.info@gmail.com"
                    className="text-blue-600 hover:underline"
                >
                    collidedgalaxies.info@gmail.com
                </Link>
            </li>

            <li>
                Phone:{" "}
                <Link
                    href="tel:+919025865018"
                    className="text-blue-600 hover:underline"
                >
                    +91 90258 65018
                </Link>
            </li>

            <li>
                Instagram DM:{" "}
                <Link
                    href="https://www.instagram.com/coga.in/"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                >
                    @collidedgalaxies
                </Link>
            </li>
        </ul>
    );
}