import { useState } from "react";
import { Menu } from "@/hooks/useMenus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MenuPublishProps {
  menu: Menu;
  onPublish: () => Promise<boolean>;
  className?: string;
}

export default function MenuPublish({
  menu,
  onPublish,
  className = "",
}: MenuPublishProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const success = await onPublish();
      if (success) {
        toast({
          title: "Menu published",
          description: "Your menu is now live and available for customers",
          variant: "success",
        });
      } else {
        toast({
          title: "Failed to publish",
          description: "There was a problem publishing your menu",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Menu Status</span>
          <Badge variant={menu.status === "published" ? "success" : "default"}>
            {menu.status === "published" ? "Published" : "Draft"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Publish your menu to make it available to customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {menu.status === "published" ? (
            <div className="text-sm">
              <p className="flex items-center text-green-600">
                <Icons.checkCircle className="mr-2 h-4 w-4" />
                This menu is published and visible to customers
              </p>
              {menu.publishedAt && (
                <p className="text-muted-foreground mt-2">
                  Last published: {new Date(menu.publishedAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm">
              <p className="flex items-center text-amber-600">
                <Icons.alert className="mr-2 h-4 w-4" />
                This menu is in draft mode and not visible to customers
              </p>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">What happens when you publish:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Your menu becomes visible to customers</li>
              <li>QR codes pointing to this menu will display the published version</li>
              <li>Changes you make after publishing won&apos;t be visible until you publish again</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePublish}
          disabled={isPublishing || menu.status === "published"}
          className="w-full"
        >
          {isPublishing ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : menu.status === "published" ? (
            "Already Published"
          ) : (
            <>
              <Icons.check className="mr-2 h-4 w-4" />
              Publish Menu
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
