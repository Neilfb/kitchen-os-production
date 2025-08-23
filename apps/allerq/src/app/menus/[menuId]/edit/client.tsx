'use client';

import { useState, useEffect } from "react";
import { useMenus, MenuInput } from "@/hooks/useMenus";

interface MenuEditClientProps {
  menuId: string;
}

export default function MenuEditClient({ menuId }: MenuEditClientProps) {
  const { getMenuById, updateMenu } = useMenus();
  const [menu, setMenu] = useState<MenuInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const m = await getMenuById(menuId);
        setMenu(m);
        setTags(m?.tags || []);
      } catch (err) {
        setError("Failed to load menu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMenu();
  }, [menuId, getMenuById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!menu) return;
    setMenu({
      ...menu,
      [e.target.name]: e.target.value,
    });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputTags = e.target.value.split(",").map((tag) => tag.trim());
    setTags(inputTags.filter((t) => t !== ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menu) return;
    
    try {
      await updateMenu(menuId, {
        ...menu,
        tags,
      });
      alert("Menu updated successfully");
    } catch (err) {
      setError("Failed to update menu");
      console.error(err);
    }
  };

  if (loading) return <div>Loading menu details...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!menu) return <div>Menu not found</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={menu.name || ""}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
      </div>
      
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          name="description"
          value={menu.description || ""}
          onChange={handleChange}
          className="w-full border rounded p-2 h-24"
        />
      </div>
      
      <div>
        <label className="block mb-1 font-medium">Tags (comma-separated)</label>
        <input
          type="text"
          value={tags.join(", ")}
          onChange={handleTagChange}
          className="w-full border rounded p-2"
        />
      </div>
      
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </form>
  );
}
