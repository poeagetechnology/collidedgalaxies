import Image from "next/image";
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

type Cat = {
  id: string;
  name: string;
  imageUrl?: string;
};

type Props = {
  categories: Cat[];
  onEdit: (cat: Cat) => void;
  onDelete: (id: string) => void;
};

export default function CategoryTable({ categories, onEdit, onDelete }: Props) {
  return (
    <div className={`overflow-x-auto mb-10 ${albertSans.className}`}>
      <table className="w-full bg-white border border-collapse border-gray-200 shadow-md min-w-max">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Image
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Category Name
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id} className="hover:bg-gray-50">
              <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm">
                <div className="w-16 h-16 relative">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      width={1000}
                      height={1000}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-center text-xs">No Image</span>
                    </div>
                  )}
                </div>
              </td>

              <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                {cat.name}
              </td>

              <td className="py-2 px-2 sm:px-4 border border-gray-300">
                <div className="flex gap-1 sm:gap-2 whitespace-nowrap">
                  <button
                    onClick={() => onEdit(cat)}
                    className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-2 sm:px-3 py-1 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(cat.id)}
                    className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-2 sm:px-3 py-1 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan={2} className="py-4 text-center text-sm text-gray-400">
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
