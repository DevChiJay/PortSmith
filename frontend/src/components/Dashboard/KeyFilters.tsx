import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import type { ActiveFilter, ApiInfo } from '@/app/(portal)/dashboard/types';

interface KeyFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  apiFilter: string;
  onApiChange: (value: string) => void;
  availableApis: ApiInfo[];
  activeFilters: ActiveFilter[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

export function KeyFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  apiFilter,
  onApiChange,
  availableApis,
  activeFilters,
  onRemoveFilter,
  onClearAll,
}: KeyFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search by key name or API..."
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={apiFilter} onValueChange={onApiChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by API" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All APIs</SelectItem>
            {availableApis.map((api) => (
              <SelectItem key={api.id || (api as any)._id} value={api.id || (api as any)._id}>
                {api.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FilterChips
        filters={activeFilters}
        onRemove={onRemoveFilter}
        onClearAll={onClearAll}
      />
    </div>
  );
}
