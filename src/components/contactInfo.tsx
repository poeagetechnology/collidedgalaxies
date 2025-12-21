"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactInfo() {
    const contactItems = [
        {
            label: "Email:",
            href: "mailto:collidedgalaxies.info@gmail.com",
            text: "collidedgalaxies.info@gmail.com",
        },
        {
            label: "Phone:",
            href: "tel:+919025865018",
            text: "+91 90258 65018",
        },
        {
            label: "Instagram DM:",
            href: "https://www.instagram.com/coga.in/",
            text: "@collidedgalaxies",
            external: true,
        },
    ];

    return (
        <motion.ul 
          className="space-y-2 text-gray-700"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: false, margin: "-50px" }}
        >
            {contactItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: false, margin: "-50px" }}
                >
                    {item.label}{" "}
                    <motion.div
                      className="inline-block"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                        <Link
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            className="text-blue-600 hover:underline"
                        >
                            {item.text}
                        </Link>
                    </motion.div>
                </motion.li>
            ))}
        </motion.ul>
    );
}