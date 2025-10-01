import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Boards() {
  return (
    <div className="w-full min-h-screen px-10 pt-10">
      {/* Headers */}
      <div className="flex flex-row justify-between h-20 ">
        <div>
          <h1 className="font-bold text-3xl">
            Hello <span className="text-primary">Teuku Sulthan</span>.{" "}
          </h1>
          <h2 className="font-bold text-secondary text-xl">
            Here’s an overview of your boards.
          </h2>
        </div>
        <div>
          <Button variant="ghost">
            {" "}
            <Plus /> Create Board
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            className="cursor-pointer hover:bg-muted/30 hover:scale-105 transition-all duration-500"
            key={i}
          >
            <CardContent>
              <CardTitle> Board {i + 1} </CardTitle>
              <CardDescription>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Possimus, illum nemo? Eaque magnam perferendis, porro quia vitae
                provident dicta voluptates est vero numquam rem, ad obcaecati.
                Modi veniam eaque cum!
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <footer className="border-t mt-10 py-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">Tasky App</span>. All rights reserved.
        </p>
        <p className="mt-2">
          Built with Love by <span className="text-primary">Teuku Sulhtan</span>
          .
        </p>
      </footer>
    </div>
  );
}
