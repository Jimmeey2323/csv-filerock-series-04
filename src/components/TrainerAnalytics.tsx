
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface TrainerAnalyticsProps {
  bookingsData: any[];
  processedData: any[];
}

interface TrainerStats {
  trainerName: string;
  totalBookings: number;
  checkins: number;
  cancellations: number;
  lateCancellations: number;
  noShows: number;
  classes: number;
  uniqueMembers: number;
  checkInRate: number;
  cancellationRate: number;
}

const TrainerAnalytics: React.FC<TrainerAnalyticsProps> = ({
  bookingsData,
  processedData
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const trainerStats = useMemo(() => {
    const statsMap = new Map<string, TrainerStats>();

    // Process bookings data
    bookingsData.forEach(booking => {
      const trainerName = booking.Teacher || booking.teacher || booking['Teacher Name'] || 'Unknown';
      const status = booking.Status || booking.status || booking['Booking Status'] || '';
      const clientEmail = booking['Client email'] || booking.email || booking['Customer Email'] || '';
      
      if (!statsMap.has(trainerName)) {
        statsMap.set(trainerName, {
          trainerName,
          totalBookings: 0,
          checkins: 0,
          cancellations: 0,
          lateCancellations: 0,
          noShows: 0,
          classes: 0,
          uniqueMembers: 0,
          checkInRate: 0,
          cancellationRate: 0
        });
      }

      const stats = statsMap.get(trainerName)!;
      stats.totalBookings++;

      // Count different status types
      const statusLower = status.toLowerCase();
      if (statusLower.includes('checked in') || statusLower.includes('attended')) {
        stats.checkins++;
      } else if (statusLower.includes('cancelled') || statusLower.includes('cancel')) {
        stats.cancellations++;
        if (statusLower.includes('late')) {
          stats.lateCancellations++;
        }
      } else if (statusLower.includes('no show') || statusLower.includes('no-show')) {
        stats.noShows++;
      }
    });

    // Count unique members and classes per trainer
    const uniqueMembersMap = new Map<string, Set<string>>();
    const classesMap = new Map<string, Set<string>>();

    bookingsData.forEach(booking => {
      const trainerName = booking.Teacher || booking.teacher || booking['Teacher Name'] || 'Unknown';
      const clientEmail = booking['Client email'] || booking.email || booking['Customer Email'] || '';
      const className = booking['Class Name'] || booking.class || booking.Class || '';
      const date = booking.Date || booking.date || booking['Class Date'] || '';

      if (!uniqueMembersMap.has(trainerName)) {
        uniqueMembersMap.set(trainerName, new Set());
      }
      if (!classesMap.has(trainerName)) {
        classesMap.set(trainerName, new Set());
      }

      if (clientEmail) {
        uniqueMembersMap.get(trainerName)!.add(clientEmail);
      }
      if (className && date) {
        classesMap.get(trainerName)!.add(`${className}-${date}`);
      }
    });

    // Calculate final stats
    statsMap.forEach((stats, trainerName) => {
      stats.uniqueMembers = uniqueMembersMap.get(trainerName)?.size || 0;
      stats.classes = classesMap.get(trainerName)?.size || 0;
      stats.checkInRate = stats.totalBookings > 0 ? (stats.checkins / stats.totalBookings) * 100 : 0;
      stats.cancellationRate = stats.totalBookings > 0 ? (stats.cancellations / stats.totalBookings) * 100 : 0;
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalBookings - a.totalBookings);
  }, [bookingsData]);

  const filteredStats = useMemo(() => {
    if (!searchTerm) return trainerStats;
    return trainerStats.filter(stat => 
      stat.trainerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trainerStats, searchTerm]);

  const getBadgeVariant = (rate: number, type: 'checkin' | 'cancellation') => {
    if (type === 'checkin') {
      if (rate >= 80) return 'success';
      if (rate >= 60) return 'warning';
      return 'destructive';
    } else {
      if (rate <= 10) return 'success';
      if (rate <= 25) return 'warning';
      return 'destructive';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-luxury border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Trainer Performance Analytics
          </CardTitle>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/60 backdrop-blur-sm border-white/40"
              />
            </div>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {filteredStats.length} trainers
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-xl border border-white/20 bg-white/40 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-800/95 to-slate-700/95 hover:bg-gradient-to-r hover:from-slate-800/95 hover:to-slate-700/95">
                  <TableHead className="text-white font-bold">Trainer</TableHead>
                  <TableHead className="text-white font-bold text-center">Total Bookings</TableHead>
                  <TableHead className="text-white font-bold text-center">Check-ins</TableHead>
                  <TableHead className="text-white font-bold text-center">Cancellations</TableHead>
                  <TableHead className="text-white font-bold text-center">Late Cancellations</TableHead>
                  <TableHead className="text-white font-bold text-center">No Shows</TableHead>
                  <TableHead className="text-white font-bold text-center">Classes</TableHead>
                  <TableHead className="text-white font-bold text-center">Unique Members</TableHead>
                  <TableHead className="text-white font-bold text-center">Check-in Rate</TableHead>
                  <TableHead className="text-white font-bold text-center">Cancellation Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStats.length > 0 ? filteredStats.map((stat, index) => (
                  <TableRow 
                    key={stat.trainerName}
                    className="hover:bg-blue-50/30 transition-all duration-300 border-b border-slate-200/30"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-semibold text-slate-800">
                      {stat.trainerName}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <Badge variant="outline" className="bg-white/80">
                        {stat.totalBookings}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="font-medium">{stat.checkins}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-orange-600" />
                        <span className="font-medium">{stat.cancellations}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-red-600" />
                        <span className="font-medium">{stat.lateCancellations}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {stat.noShows}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">{stat.classes}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-purple-600" />
                        <span className="font-medium">{stat.uniqueMembers}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getBadgeVariant(stat.checkInRate, 'checkin')}>
                        {stat.checkInRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getBadgeVariant(stat.cancellationRate, 'cancellation')}>
                        {stat.cancellationRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No trainers found matching your search.' : 'No trainer data available.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerAnalytics;
