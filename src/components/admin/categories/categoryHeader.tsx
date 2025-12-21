
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

type Props = {
  onAdd: () => void;
};

export default function CategoryHeader({ onAdd }: Props) {
  return (
    <div className={`flex items-center justify-between mb-4 ${albertSans.className}`}>
      <h1 className="text-xl sm:text-2xl font-bold">Category List</h1>

      <button
        onClick={onAdd}
        className="bg-black hover:bg-gray-700 cursor-pointer text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base whitespace-nowrap"
      >
        Add Category
      </button>
    </div>
  );
}
