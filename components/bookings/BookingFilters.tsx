// app/admin/bookings/components/BookingFilters.tsx
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface BookingFiltersProps {
  filterStatus: string;
  searchQuery: string;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function BookingFilters({
  filterStatus,
  searchQuery,
  onStatusChange,
  onSearchChange,
}: BookingFiltersProps) {
  return (
    <Card className="bg-white border-gray-200 mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-gray-700 mb-2 block">Search</Label>
            <Input
              placeholder="Search by booking number, guest name, or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Label className="text-gray-700 mb-2 block">Filter by Status</Label>
            <Select value={filterStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}