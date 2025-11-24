// app/admin/rooms/components/RoomStats.tsx
import { DoorOpen, CheckCircle2, Clock, XCircle, Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RoomStatsProps {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
}

export function RoomStats({
  totalRooms,
  availableRooms,
  occupiedRooms,
  reservedRooms,
  cleaningRooms,
  maintenanceRooms,
}: RoomStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Total Rooms */}
      <Card className="bg-linear-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg mb-2">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
            <p className="text-amber-700 text-xs font-medium mb-1">Total</p>
            <p className="text-2xl font-bold text-amber-900">{totalRooms}</p>
          </div>
        </CardContent>
      </Card>

      {/* Available */}
      <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-lg mb-2">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-green-700 text-xs font-medium mb-1">Available</p>
            <p className="text-2xl font-bold text-green-900">{availableRooms}</p>
          </div>
        </CardContent>
      </Card>

      {/* Occupied */}
      <Card className="bg-linear-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg mb-2">
              <DoorOpen className="w-6 h-6 text-white" />
            </div>
            <p className="text-orange-700 text-xs font-medium mb-1">Occupied</p>
            <p className="text-2xl font-bold text-orange-900">{occupiedRooms}</p>
          </div>
        </CardContent>
      </Card>

      {/* Reserved */}
      <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg mb-2">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-blue-700 text-xs font-medium mb-1">Reserved</p>
            <p className="text-2xl font-bold text-blue-900">{reservedRooms}</p>
          </div>
        </CardContent>
      </Card>

      {/* Cleaning */}
      <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg mb-2">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <p className="text-purple-700 text-xs font-medium mb-1">Cleaning</p>
            <p className="text-2xl font-bold text-purple-900">{cleaningRooms}</p>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card className="bg-linear-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shadow-lg mb-2">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-red-700 text-xs font-medium mb-1">Maintenance</p>
            <p className="text-2xl font-bold text-red-900">{maintenanceRooms}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}