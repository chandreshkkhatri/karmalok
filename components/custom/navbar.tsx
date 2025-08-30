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
      <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl absolute top-0 left-0 w-dvw py-3 px-4 justify-between flex flex-row items-center z-30 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-row gap-3 items-center">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              prefetch={false}
            >
              <Image
                src="/images/karmalok-logo.png"
                height={100}
                width={100}
                alt="Karmalok logo"
                className="h-10 w-auto"
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  Karmalok
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  AI Assistant
                </span>
              </div>
            </Link>
          </div>
        </div>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="py-2 px-4 h-fit font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-none rounded-full transition-all duration-200"
                variant="secondary"
              >
                <div className="flex items-center gap-2">
                  <div className="size-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {session.user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">
                    {session.user?.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg"
            >
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
            className="py-2 px-6 h-fit font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            asChild
          >
            <Link href="/login">Get Started</Link>
          </Button>
        )}
      </div>
    </>
  );
};
