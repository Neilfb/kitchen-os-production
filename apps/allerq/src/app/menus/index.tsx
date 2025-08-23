// Menu list page
import Link from "next/link";
import { useEffect } from "react";
import { useMenus, Menu } from "../../hooks/useMenus";

export default function MenusIndex() {
  const { menus, loading, error, fetchMenus, deleteMenu } = useMenus();
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);
  return (
    <main className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menus</h1>
        <Link
          href="/menus/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Bulk Upload
        </Link>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y divide-gray-200">
        {menus.length === 0 ? (
          <li className="py-4 text-gray-500">No menus found.</li>
        ) : (
          menus.map((m: Menu) => (
            <li key={m.id} className="py-4 flex justify-between items-center">
              <span>{m.name}</span>
              <div className="flex gap-2">
                <Link
                  href={{
                    pathname: "/menus/[menuId]/edit",
                    query: { menuId: m.id }
                  }}
                  className="text-blue-700 hover:underline"
                >
                  Edit
                </Link>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => deleteMenu(m.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
