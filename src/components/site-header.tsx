import { Fragment } from "react";
import { useTheme } from "next-themes";
import { Link, useLocation } from "react-router-dom";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  SearchIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  CheckIcon,
  LogOutIcon,
  HelpCircleIcon,
  Settings2Icon,
  ExternalLinkIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useCommandMenu } from "@/hooks/useCommandMenu";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Strix route labels.
 *
 * Keep this intentionally small.
 * The header should only understand the application's
 * high-level navigation, not individual business data.
 */
const routeLabels: Record<string, string> = {
  search: "Search Leads",
  leads: "Leads",
  map: "Map",
  research: "Research",
  signals: "Signals",
  settings: "Settings",
  help: "Help",
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [
      {
        label: "Dashboard",
        href: "/",
        isCurrent: true,
      },
    ];
  }

  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");

    const label =
      routeLabels[segment] ??
      segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

    return {
      label,
      href,
      isCurrent: index === segments.length - 1,
    };
  });
}

function getInitials(name?: string | null) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Theme selector.
 */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    {
      value: "light",
      label: "Light",
      Icon: SunIcon,
    },
    {
      value: "dark",
      label: "Dark",
      Icon: MoonIcon,
    },
    {
      value: "system",
      label: "System",
      Icon: MonitorIcon,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-8"
          aria-label="Change appearance"
        >
          <SunIcon className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
          Appearance
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {options.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="cursor-pointer gap-2 text-sm"
          >
            <Icon className="text-muted-foreground size-3.5" />

            {label}

            {theme === value && <CheckIcon className="ml-auto size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Strix signal / activity menu.
 *
 * This is intentionally different from a generic
 * application notification system.
 */
function SignalsButton() {
  const unread = 3;

  const signals = [
    {
      title: "New CTO detected",
      company: "Acme Technologies",
      time: "2h ago",
      dot: "bg-foreground",
    },
    {
      title: "Engineering hiring increased",
      company: "Finly",
      time: "5h ago",
      dot: "bg-emerald-500",
    },
    {
      title: "New company added",
      company: "Orbit Technologies",
      time: "Yesterday",
      dot: "bg-blue-500",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground relative size-8"
          aria-label="View signals"
        >
          <BellIcon className="size-4" />

          {unread > 0 && (
            <span
              className="
                bg-foreground
                text-background
                absolute
                -right-0.5
                -top-0.5
                flex
                size-4
                items-center
                justify-center
                rounded-full
                text-[9px]
                font-semibold
              "
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold">Recent Signals</span>

          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {unread} new
          </Badge>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {signals.map((signal) => (
          <DropdownMenuItem key={`${signal.company}-${signal.title}`} asChild>
            <Link
              to="/signals"
              className="
                flex
                cursor-pointer
                flex-col
                items-start
                gap-0.5
                py-2.5
              "
            >
              <div className="flex w-full items-center gap-2">
                <span
                  className={cn("size-1.5 shrink-0 rounded-full", signal.dot)}
                  aria-hidden="true"
                />

                <span className="flex-1 text-sm font-medium">
                  {signal.title}
                </span>

                <span className="text-muted-foreground shrink-0 text-xs">
                  {signal.time}
                </span>
              </div>

              <p className="text-muted-foreground pl-3.5 text-xs">
                {signal.company}
              </p>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/signals"
            className="text-muted-foreground hover:text-foreground w-full justify-center text-xs"
          >
            View all signals
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * User menu.
 */
function UserQuickMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 gap-2 px-2"
          aria-label="Open account menu"
        >
          <Avatar className="size-7 rounded-md">
            <AvatarFallback className="rounded-md text-[10px] font-semibold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user.fullName}</span>

            <span className="text-muted-foreground text-xs">{user.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings2Icon className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/help">
            <HelpCircleIcon className="mr-2 size-4" />
            Help & Support
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href="https://strix.website"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLinkIcon className="mr-2 size-4" />
            Strix Website
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="text-destructive focus:text-destructive"
        >
          <LogOutIcon className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const breadcrumbs = useBreadcrumbs();
  const { open: openCommandMenu } = useCommandMenu();

  return (
    <header
      className="
        bg-background/95
        sticky
        top-0
        z-50
        flex
        h-16
        shrink-0
        items-center
        border-b
        backdrop-blur-sm
      "
    >
      <div className="flex w-full items-center gap-2 px-4">
        {/* Left: sidebar + breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SidebarTrigger
            className="
              text-muted-foreground
              hover:text-foreground
              -ml-1
              size-8
            "
            aria-label="Toggle sidebar"
          />

          <Separator orientation="vertical" className="mx-1 h-8" />

          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              {breadcrumbs.map((crumb, index) => (
                <Fragment key={crumb.href}>
                  {index > 0 && <BreadcrumbSeparator />}

                  <BreadcrumbItem className="min-w-0">
                    {crumb.isCurrent ? (
                      <BreadcrumbPage className="text-foreground truncate text-sm font-medium">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          to={crumb.href}
                          className="text-muted-foreground hover:text-foreground text-sm"
                        >
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Center: global lead search */}
        <Button
          variant="outline"
          onClick={openCommandMenu}
          className="
            text-muted-foreground
            hidden
            h-9
            w-52
            justify-between
            gap-2
            border-dashed
            px-3
            text-sm
            font-normal
            sm:flex
            lg:w-72
          "
          id="search-trigger"
          aria-label="Search leads"
        >
          <div className="flex items-center gap-2">
            <SearchIcon className="size-3.5 shrink-0" />

            <span>Search leads...</span>
          </div>

          <kbd
            className="
              bg-muted
              text-muted-foreground
              pointer-events-none
              inline-flex
              h-5
              items-center
              gap-1
              rounded
              border
              px-1.5
              font-mono
              text-[10px]
              font-medium
            "
          >
            ⌘K
          </kbd>
        </Button>

        {/* Right: global actions */}
        <div className="flex items-center gap-1">
          <SignalsButton />

          <ThemeToggle />

          <UserQuickMenu />
        </div>
      </div>
    </header>
  );
}
