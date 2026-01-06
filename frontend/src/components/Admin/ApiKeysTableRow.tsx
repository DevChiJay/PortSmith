import { format } from 'date-fns';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { ApiKey } from '@/app/admin/types';

interface ApiKeysTableRowProps {
  apiKey: ApiKey;
  onEdit: (key: ApiKey) => void;
  onDelete: (key: ApiKey) => void;
}

export function ApiKeysTableRow({ apiKey: key, onEdit, onDelete }: ApiKeysTableRowProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const maskKey = (keyString: string) => {
    if (keyString.length <= 8) return keyString;
    return `${keyString.substring(0, 4)}...${keyString.substring(keyString.length - 4)}`;
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-sm">{key.name}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground font-mono cursor-help">
                  {maskKey(key.key)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs">{key.key}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
      <TableCell>
        {key.user ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={key.user.avatarUrl} alt={key.user.name} />
              <AvatarFallback className="text-xs">{getInitials(key.user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm">{key.user.name}</span>
              <span className="text-xs text-muted-foreground">{key.user.email}</span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unknown</span>
        )}
      </TableCell>
      <TableCell>
        {key.api ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{key.api.name}</span>
            <span className="text-xs text-muted-foreground">/{key.api.slug}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unknown</span>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant={
            key.status === 'active'
              ? 'default'
              : key.status === 'inactive'
              ? 'secondary'
              : 'destructive'
          }
        >
          {key.status}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm">{key.requestCount.toLocaleString()}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {format(new Date(key.createdAt), 'MMM d, yyyy')}
        </span>
      </TableCell>
      <TableCell>
        {key.lastUsed ? (
          <span className="text-sm text-muted-foreground">
            {format(new Date(key.lastUsed), 'MMM d, yyyy')}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Never</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {format(new Date(key.expiresAt), 'MMM d, yyyy')}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(key)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Key
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(key)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Key
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
