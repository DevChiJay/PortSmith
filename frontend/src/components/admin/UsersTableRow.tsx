import { format } from 'date-fns';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, ShieldCheck, Shield, Mail, Pencil, Trash2 } from 'lucide-react';
import type { User } from '@/app/admin/types';

interface UsersTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTableRow({ user, onEdit, onDelete }: UsersTableRowProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
          {user.role === 'admin' ? (
            <>
              <ShieldCheck className="h-3 w-3 mr-1" />
              Admin
            </>
          ) : (
            <>
              <Shield className="h-3 w-3 mr-1" />
              User
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={user.isVerified ? 'default' : 'secondary'}>
          {user.isVerified ? (
            <>
              <Mail className="h-3 w-3 mr-1" />
              Verified
            </>
          ) : (
            'Unverified'
          )}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm">
          {user.activeKeyCount}/{user.apiKeyCount}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm">{user.totalRequests.toLocaleString()}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {format(new Date(user.joinDate), 'MMM d, yyyy')}
        </span>
      </TableCell>
      <TableCell>
        {user.lastActivity ? (
          <span className="text-sm text-muted-foreground">
            {format(new Date(user.lastActivity), 'MMM d, yyyy')}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Never</span>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(user)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
