import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/Button";
import Link from "next/link";
import { FaBarsStaggered } from "react-icons/fa6";
import { NetworkComponent } from "../Common/NetworkComponent";
import { ShowETHBalance } from "./ShowETHBalance";

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"transparent"}>
          <FaBarsStaggered />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/swap" className="w-full">
              Swap
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/pool" className="w-full">
              Pool
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/Faucet" className="w-full">
              Faucet
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuItem>
          <ShowETHBalance />
        </DropdownMenuItem>
        {/* <DropdownMenuItem>
          <LogOut className="text-red-600" />
          <span className="text-red-700">Disconnet</span>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
