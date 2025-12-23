'use client';

import { useState, useMemo } from 'react';
import { useUsersAnalytics } from '@/hooks/use-admin-metrics';
import { UserPlus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorState } from '@/components/ErrorState';
import { PageTransition } from '@/components/PageTransition';
import { exportUsers } from '@/utils/export';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import { UsersTableRow } from '@/components/admin/UsersTableRow';
import type { User } from '@/app/admin/types';
import { Filter } from 'lucide-react';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const limit = 25;

  const { users, pagination, isLoading, error } = useUsersAnalytics(page, limit, search, roleFilter, statusFilter);

  const refreshData = () => {
    mutate(`/api/admin/analytics/users?page=${page}&limit=${limit}&search=${search}&role=${roleFilter}&status=${statusFilter}`);
  };

  const activeFilters = useMemo(() => {
    const filters = [];
    if (roleFilter && roleFilter !== 'all') {
      filters.push({ key: 'role', label: 'Role', value: roleFilter });
    }
    if (statusFilter && statusFilter !== 'all') {
      filters.push({ key: 'status', label: 'Status', value: statusFilter });
    }
    return filters;
  }, [roleFilter, statusFilter]);

  const removeFilter = (key: string) => {
    if (key === 'role') setRoleFilter('');
    if (key === 'status') setStatusFilter('');
  };

  const clearAllFilters = () => {
    setRoleFilter('');
    setStatusFilter('');
    setSearch('');
  };

  const handleExport = () => {
    if (users && users.length > 0) {
      exportUsers(users);
      toast.success('Users exported successfully');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  if (error) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <ErrorState variant="network" message={error} onRetry={refreshData} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PageTransition>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage platform users and their access</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={!users || users.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <SearchBar
                      value={search}
                      onChange={(value) => {
                        setSearch(value);
                        setPage(1);
                      }}
                      placeholder="Search by name or email..."
                    />
                  </div>
                  <Select
                    value={roleFilter || 'all'}
                    onValueChange={(value) => {
                      setRoleFilter(value === 'all' ? '' : value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) => {
                      setStatusFilter(value === 'all' ? '' : value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FilterChips filters={activeFilters} onRemove={removeFilter} onClearAll={clearAllFilters} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Users ({pagination?.totalUsers || 0})</CardTitle>
              <CardDescription>A list of all users including their name, email, role, and activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No users found</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>API Keys</TableHead>
                        <TableHead>Requests</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <UsersTableRow
                          key={user.id}
                          user={user}
                          onEdit={handleEditUser}
                          onDelete={handleDeleteUser}
                        />
                      ))}
                    </TableBody>
                  </Table>

                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {selectedUser && (
            <>
              <EditUserDialog
                user={{
                  id: selectedUser.id,
                  full_name: selectedUser.name,
                  email: selectedUser.email,
                  role: selectedUser.role,
                  is_verified: selectedUser.isVerified,
                }}
                onSuccess={refreshData}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
              />
              <DeleteUserDialog
                userId={selectedUser.id}
                userEmail={selectedUser.email}
                onSuccess={refreshData}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              />
            </>
          )}
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
}
