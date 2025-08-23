"use client";

import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MenuItem } from "@/hooks/useMenuItems";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

interface MenuItemReorderProps {
  items: MenuItem[];
  onSave: (items: MenuItem[]) => Promise<boolean>;
  onClose: () => void;
}

const ItemType = "MENU_ITEM";

interface DraggableItemProps {
  item: MenuItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

function DraggableItem({ item, index, moveItem }: DraggableItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem: { index: number }) => {
      if (!ref.current) return;
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div 
      ref={ref} 
      className={`p-3 mb-2 rounded-md border flex items-center ${
        isDragging ? "opacity-50 bg-gray-100" : "bg-white"
      }`}
      style={{ cursor: "move" }}
    >
      <div className="mr-2 text-gray-400">
        <Icons.moreVertical className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{item.name}</p>
        {item.category && <p className="text-sm text-gray-500">Category: {item.category}</p>}
      </div>
    </div>
  );
}

export default function MenuItemReorder({ items: initialItems, onSave, onClose }: MenuItemReorderProps) {
  const [items, setItems] = useState<MenuItem[]>([...initialItems]);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const newItems = [...items];
    const draggedItem = newItems[dragIndex];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    setItems(newItems);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Add order property to each item based on its index
      const orderedItems = items.map((item, index) => ({
        ...item,
        order: index,
      }));
      
      const success = await onSave(orderedItems);
      if (success) {
        toast({
          title: "Success",
          description: "Menu items reordered successfully",
          variant: "success",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save menu item order",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Reorder Menu Items</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Order"
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-500">
            Drag and drop menu items to change their display order. Changes will take
            effect after clicking &quot;Save Order&quot;.
          </p>
          <div className="space-y-2">
            {items.map((item, index) => (
              <DraggableItem
                key={item.id}
                item={item}
                index={index}
                moveItem={moveItem}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </DndProvider>
  );
}
