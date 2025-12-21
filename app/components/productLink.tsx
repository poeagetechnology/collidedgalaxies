import Link from "next/link";
import { slugify } from "@/src/server/utils/slugify";

type ProductLinkProps = {
  product: {
    id?: string;
    slug?: string;
    title?: string;
  };
  children: React.ReactNode;
  className?: string;
};

export default function ProductLink({ product, children, className }: ProductLinkProps) {
  const safeTitle = product.title || "product";
  const safeId = product.id || "";
  
  const href = product.slug
    ? `/products/${product.slug}`
    : `/products/${slugify(safeTitle)}-${safeId}`;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
