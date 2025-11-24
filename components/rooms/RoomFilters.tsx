// app/admin/rooms/components/RoomFilters.tsx
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

interface RoomType {
  id: string;
  name: string;
}

interface RoomFiltersProps {
  filterStatus: string;
  filterRoomType: string;
  searchQuery: string;
  roomTypes: RoomType[];
  onStatusChange: (value: string) => void;
  onRoomTypeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function RoomFilters({
  filterStatus,
  filterRoomType,
  searchQuery,
  roomTypes,
  onStatusChange,
  onRoomTypeChange,
  onSearchChange,
}: RoomFiltersProps) {
  return (
    <Card className="bg-white border-gray-200 mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <Label className="text-gray-700 mb-2 block">Search</Label>
            <Input
              placeholder="Search by room number..."
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
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="CLEANING">Cleaning</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-[200px]">
            <Label className="text-gray-700 mb-2 block">Filter by Room Type</Label>
            <Select value={filterRoomType} onValueChange={onRoomTypeChange}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}