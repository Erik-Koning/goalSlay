"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { StreakBadge } from "@/src/components/gamification/StreakDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
  IconEye,
} from "@tabler/icons-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  streakCurrent: number;
  streakLongest: number;
  totalPoints: number;
  createdAt: string;
  _count: {
    goalSets: number;
    dailyUpdates: number;
    userAchievements: number;
  };
}

interface UserTableProps {
  onViewUser?: (userId: string) => void;
  className?: string;
}

export function UserTable({ onViewUser, className }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Streak</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-center">Goals</TableHead>
              <TableHead className="text-center">Updates</TableHead>
              <TableHead className="text-center">Badges</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <IconLoader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>
                          {user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <StreakBadge streak={user.streakCurrent} />
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {user.totalPoints.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">{user._count.goalSets}</TableCell>
                  <TableCell className="text-center">{user._count.dailyUpdates}</TableCell>
                  <TableCell className="text-center">{user._count.userAchievements}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewUser?.(user.id)}
                    >
                      <IconEye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
