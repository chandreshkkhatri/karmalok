import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/app/(auth)/auth";

import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Navbar = async () => {
  let session = await auth();

  return (
    <>
      <div className="bg-white dark:bg-gray-950 fixed top-0 left-0 right-0 h-16 px-4 flex items-center justify-between z-30 border-b border-gray-200 dark:border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          prefetch={false}
        >
          <Image
            src="/images/karmalok-logo.png"
            height={100}
            width={100}
            alt="Karmalok logo"
            className="h-8 w-auto"
          />
          <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:inline">
            Karmalok
          </span>
        </Link>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="p-2 h-fit bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
                variant="secondary"
              >
                <div className="size-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {session.user?.email?.charAt(0).toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
            >
              <DropdownMenuItem disabled className="text-sm">
                {session.user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-800">
                <ThemeToggle />
              </DropdownMenuItem>
              <DropdownMenuItem className="p-1 z-50">
                <form
                  className="w-full"
                  action={async () => {
                    "use server";

                    await signOut({
                      redirectTo: "/",
                    });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            className="px-4 py-2 h-fit font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            asChild
          >
            <Link href="/login">Sign In</Link>
          </Button>
        )}
      </div>
    </>
  );
};
