// Menu list component
import { useMenus, Menu } from "../hooks/useMenus";
import { useState } from "react";
import { PublicRestaurantParams } from "@/lib/route-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

interface MenuListProps {
  restaurantId?: PublicRestaurantParams["restaurantId"];
  publicView?: boolean;
}

export default function MenuList({ restaurantId, publicView }: MenuListProps) {
  const { menus, loading, error, deleteMenu, updateMenuOrder } = useMenus();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "items" | "date" | "order">("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [reordering, setReordering] = useState(false);
  const [menuOrder, setMenuOrder] = useState<string[]>([]);
  
  // Filter and sort menus
  const filteredMenus = restaurantId 
    ? menus.filter(m => {
        const matchesRestaurant = m.restaurantId === restaurantId;
        const matchesSearch = !searchTerm || 
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRestaurant && matchesSearch;
      })
    : menus.filter(m => 
        !searchTerm || 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const sortedMenus = [...filteredMenus].sort((a, b) => {
    if (sortBy === "order" && menuOrder.length > 0) {
      const aIndex = menuOrder.indexOf(a.id);
      const bIndex = menuOrder.indexOf(b.id);
      return sortOrder === "asc" ? aIndex - bIndex : bIndex - aIndex;
    } else if (sortBy === "name") {
      return sortOrder === "asc" 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "items") {
      const aItems = a.items?.length || 0;
      const bItems = b.items?.length || 0;
      return sortOrder === "asc" ? aItems - bItems : bItems - aItems;
    } else {
      const aDate = new Date(a.updatedAt || a.createdAt || "").getTime();
      const bDate = new Date(b.updatedAt || b.createdAt || "").getTime();
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    }
  });

  const handleDeleteMenu = async (menu: Menu) => {
    if (!confirm(`Are you sure you want to delete "${menu.name}"?`)) return;
    
    try {
      await deleteMenu(menu.id);
      toast({
        title: "Menu deleted",
        description: `Successfully deleted "${menu.name}"`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete menu",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px]">
              Sort by: {sortBy}
              <Icons.chevronsUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy("name")}>
              Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("items")}>
              Number of Items
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("date")}>
              Last Updated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("order")}>
              Custom Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {!publicView && (
          <Button
            variant="outline"
            onClick={async () => {
              if (reordering) {
                // Save the new order
                const success = await updateMenuOrder({ menuIds: menuOrder });
                if (success) {
                  toast({
                    title: "Success",
                    description: "Menu order updated successfully",
                    variant: "success",
                  });
                } else {
                  toast({
                    title: "Error",
                    description: "Failed to update menu order",
                    variant: "destructive",
                  });
                }
              } else if (menuOrder.length === 0) {
                setMenuOrder(sortedMenus.map(m => m.id));
              }
              setReordering(!reordering);
            }}
          >
            {reordering ? "Done" : "Reorder"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? (
            <Icons.arrowUp className="h-4 w-4" />
          ) : (
            <Icons.arrowDown className="h-4 w-4" />
          )}
        </Button>
        {!publicView && (
          <Button 
            onClick={() => window.location.href = `/menus/new${restaurantId ? `?restaurantId=${restaurantId}` : ''}`}
          >
            <Icons.plus className="mr-2 h-4 w-4" />
            Create Menu
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Icons.spinner className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-600 p-4 text-center">{error}</div>
      ) : sortedMenus.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "No menus match your search." : "No menus found."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedMenus.map((menu) => (
            <Card key={menu.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {reordering && !publicView && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const index = menuOrder.indexOf(menu.id);
                            if (index > 0) {
                              const newOrder = [...menuOrder];
                              [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                              setMenuOrder(newOrder);
                            }
                          }}
                          disabled={menuOrder.indexOf(menu.id) === 0}
                        >
                          <Icons.arrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const index = menuOrder.indexOf(menu.id);
                            if (index < menuOrder.length - 1) {
                              const newOrder = [...menuOrder];
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                              setMenuOrder(newOrder);
                            }
                          }}
                          disabled={menuOrder.indexOf(menu.id) === menuOrder.length - 1}
                        >
                          <Icons.arrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <CardTitle>{menu.name}</CardTitle>
                  </div>
                  {!publicView && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icons.moreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => window.location.href = `/menus/${menu.id}/edit`}
                        >
                          <Icons.edit className="mr-2 h-4 w-4" />
                          Edit Menu
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => window.location.href = `/menus/${menu.id}/items`}
                        >
                          <Icons.fileText className="mr-2 h-4 w-4" />
                          Edit Items
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMenu(menu)}
                          className="text-red-600"
                        >
                          <Icons.trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {menu.description && (
                  <p className="text-sm text-gray-500 mb-2">{menu.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    <Icons.fileText className="inline mr-1 h-4 w-4" />
                    {menu.items?.length || 0} items
                  </span>
                  {menu.tags && menu.tags.length > 0 && (
                    <span>
                      <Icons.tag className="inline mr-1 h-4 w-4" />
                      {menu.tags.join(", ")}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = publicView && restaurantId 
                    ? `/r/${restaurantId}/menu/${menu.id}`
                    : `/menus/${menu.id}/items`
                  }
                >
                  {publicView ? (
                    <>
                      <Icons.eye className="mr-2 h-4 w-4" />
                      View Menu
                    </>
                  ) : (
                    <>
                      <Icons.fileText className="mr-2 h-4 w-4" />
                      Edit Items
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
