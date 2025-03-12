import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, User2, Users2, DollarSign, Percent, TrendingUp, TrendingDown, FileText, LayoutDashboard } from 'lucide-react';
import PerformanceMetricCard from '@/components/cards/PerformanceMetricCard';
import RevenueChart from '@/components/charts/RevenueChart';
import ClientDetailsModal from '@/components/ClientDetailsModal';
import { Button } from '@/components/ui/button';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProcessedTeacherData } from '@/utils/dataProcessor';

interface ResultsTableProps {
  data: ProcessedTeacherData[];
  locations: string[];
  isLoading: boolean;
  viewMode: 'table' | 'cards' | 'detailed';
  dataMode: 'teacher' | 'studio';
  onFilterChange: (filters: { location?: string; teacher?: string; period?: string; search?: string; }) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  locations,
  isLoading,
  viewMode,
  dataMode,
  onFilterChange
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientType, setClientType] = useState<'new' | 'retained' | 'converted'>('new');

  const handleOpenClientModal = (teacherName: string, type: 'new' | 'retained' | 'converted') => {
    setSelectedTeacher(teacherName);
    setClientType(type);
    setIsClientModalOpen(true);
  };

  const handleCloseClientModal = () => {
    setIsClientModalOpen(false);
    setSelectedTeacher(null);
  };
  
  // Update the displayData to handle studio view
  const displayData = useMemo(() => {
    if (dataMode === 'studio') {
      // In studio mode, only show records where teacherName is 'All Teachers'
      return data.filter(item => item.teacherName === 'All Teachers');
    }
    // In teacher mode, filter out the aggregated studio records
    return data.filter(item => item.teacherName !== 'All Teachers');
  }, [data, dataMode]);

  const getClientsForType = (type: 'new' | 'retained' | 'converted') => {
    if (!selectedTeacher) return [];
    
    const selectedData = data.find(item => 
      (item.teacherName === selectedTeacher || item.location === selectedTeacher) &&
      (dataMode === 'teacher' ? item.teacherName === selectedTeacher : item.location === selectedTeacher)
    );
    
    if (!selectedData) return [];

    switch (type) {
      case 'new': return selectedData.newClientDetails;
      case 'retained': return selectedData.retainedClientDetails;
      case 'converted': return selectedData.convertedClientDetails;
      default: return [];
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (data.length === 0) {
    return <p>No data available.</p>;
  }

  if (viewMode === 'table') {
    return (
      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                {dataMode === 'teacher' ? 'Teacher' : 'Studio'}
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">New Clients</TableHead>
              <TableHead className="text-right">Retained Clients</TableHead>
              <TableHead className="text-right">Retention Rate</TableHead>
              <TableHead className="text-right">Converted Clients</TableHead>
              <TableHead className="text-right">Conversion Rate</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((item) => (
              <TableRow key={`${item.teacherName}-${item.location}-${item.period}`}>
                <TableCell className="font-medium">{dataMode === 'teacher' ? item.teacherName : item.location}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.period}</TableCell>
                <TableCell className="text-right">{item.newClients}</TableCell>
                <TableCell className="text-right">{item.retainedClients}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={item.retentionRate > 50 ? "outline" : "destructive"} >
                    {item.retentionRate.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{item.convertedClients}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={item.conversionRate > 10 ? "outline" : "destructive"} >
                    {item.conversionRate.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">₹{item.totalRevenue.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayData.map((item) => (
          <Card key={`${item.teacherName}-${item.location}-${item.period}`} className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${item.teacherName}`} />
                    <AvatarFallback>{item.teacherName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{dataMode === 'teacher' ? item.teacherName : item.location}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.location} - {item.period}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'new')}>
                      <User2 className="mr-2 h-4 w-4" />
                      View New Clients
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'retained')}>
                      <Users2 className="mr-2 h-4 w-4" />
                      View Retained Clients
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'converted')}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Converted Clients
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      View More Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <PerformanceMetricCard
                  title="New Clients"
                  value={item.newClients.toString()}
                  icon={<User2 className="h-4 w-4 text-blue-500" />}
                  tooltip="Number of new clients acquired"
                />
                <PerformanceMetricCard
                  title="Retained Clients"
                  value={item.retainedClients.toString()}
                  secondaryValue={`${item.retentionRate.toFixed(1)}%`}
                  icon={<Users2 className="h-4 w-4 text-green-500" />}
                  status={item.retentionRate > 50 ? 'positive' : item.retentionRate < 30 ? 'negative' : 'neutral'}
                  tooltip="Number of clients retained"
                />
                <PerformanceMetricCard
                  title="Converted Clients"
                  value={item.convertedClients.toString()}
                  secondaryValue={`${item.conversionRate.toFixed(1)}%`}
                  icon={<Sparkles className="h-4 w-4 text-purple-500" />}
                  status={item.conversionRate > 10 ? 'positive' : item.conversionRate < 5 ? 'negative' : 'neutral'}
                  tooltip="Number of clients converted"
                />
                <PerformanceMetricCard
                  title="Total Revenue"
                  value={`₹${item.totalRevenue.toLocaleString()}`}
                  icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                  tooltip="Total revenue generated"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (viewMode === 'detailed') {
    return (
      <div className="grid grid-cols-1 gap-6">
        {displayData.map((item) => (
          <Card key={`${item.teacherName}-${item.location}-${item.period}`} className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{dataMode === 'teacher' ? item.teacherName : item.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.location} - {item.period}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'new')}>
                      <User2 className="mr-2 h-4 w-4" />
                      View New Clients
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'retained')}>
                      <Users2 className="mr-2 h-4 w-4" />
                      View Retained Clients
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'converted')}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Converted Clients
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      View More Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-semibold mb-2">Client Acquisition</h3>
                <div className="grid grid-cols-2 gap-4">
                  <PerformanceMetricCard
                    title="New Clients"
                    value={item.newClients.toString()}
                    icon={<User2 className="h-4 w-4 text-blue-500" />}
                    tooltip="Number of new clients acquired"
                  />
                  <PerformanceMetricCard
                    title="Trials"
                    value={item.trials.toString()}
                    icon={<FileText className="h-4 w-4 text-gray-500" />}
                    tooltip="Number of trial clients"
                  />
                  <PerformanceMetricCard
                    title="Referrals"
                    value={item.referrals.toString()}
                    icon={<Users2 className="h-4 w-4 text-sky-500" />}
                    tooltip="Number of clients from referrals"
                  />
                  <PerformanceMetricCard
                    title="Hosted Events"
                    value={item.hosted.toString()}
                    icon={<LayoutDashboard className="h-4 w-4 text-orange-500" />}
                    tooltip="Number of clients from hosted events"
                  />
                  <PerformanceMetricCard
                    title="Influencer Signups"
                    value={item.influencerSignups.toString()}
                    icon={<TrendingUp className="h-4 w-4 text-pink-500" />}
                    tooltip="Number of clients from influencer signups"
                  />
                  <PerformanceMetricCard
                    title="Others"
                    value={item.others.toString()}
                    icon={<DotsHorizontalIcon className="h-4 w-4 text-zinc-500" />}
                    tooltip="Number of clients from other sources"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold mb-2">Client Retention & Conversion</h3>
                <div className="grid grid-cols-2 gap-4">
                  <PerformanceMetricCard
                    title="Retained Clients"
                    value={item.retainedClients.toString()}
                    secondaryValue={`${item.retentionRate.toFixed(1)}%`}
                    icon={<Users2 className="h-4 w-4 text-green-500" />}
                    status={item.retentionRate > 50 ? 'positive' : item.retentionRate < 30 ? 'negative' : 'neutral'}
                    tooltip="Number of clients retained"
                  />
                  <PerformanceMetricCard
                    title="Converted Clients"
                    value={item.convertedClients.toString()}
                    secondaryValue={`${item.conversionRate.toFixed(1)}%`}
                    icon={<Sparkles className="h-4 w-4 text-purple-500" />}
                    status={item.conversionRate > 10 ? 'positive' : item.conversionRate < 5 ? 'negative' : 'neutral'}
                    tooltip="Number of clients converted"
                  />
                  <PerformanceMetricCard
                    title="Total Revenue"
                    value={`₹${item.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                    tooltip="Total revenue generated"
                  />
                  <PerformanceMetricCard
                    title="Avg. Revenue/Client"
                    value={`₹${item.averageRevenuePerClient.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<Percent className="h-4 w-4 text-teal-500" />}
                    tooltip="Average revenue per client"
                  />
                  <PerformanceMetricCard
                    title="No Show Rate"
                    value={`${item.noShowRate.toFixed(1)}%`}
                    icon={<TrendingDown className="h-4 w-4 text-red-500" />}
                    tooltip="No show rate"
                  />
                  <PerformanceMetricCard
                    title="Late Cancellation Rate"
                    value={`${item.lateCancellationRate.toFixed(1)}%`}
                    icon={<TrendingDown className="h-4 w-4 text-orange-500" />}
                    tooltip="Late cancellation rate"
                  />
                </div>
              </div>
              <div className="col-span-full">
                <h3 className="text-md font-semibold mb-2">Revenue by Week</h3>
                <RevenueChart data={item.revenueByWeek || []} />
              </div>
            </CardContent>
          </Card>
        ))}
        <ClientDetailsModal
          isOpen={isClientModalOpen}
          onClose={handleCloseClientModal}
          title={`${selectedTeacher ? selectedTeacher : 'Clients'} - ${clientType.toUpperCase()}`}
          description={`Details of ${clientType} clients for ${selectedTeacher}`}
          clients={getClientsForType(clientType)}
          type={clientType}
        />
      </div>
    );
  }

  return null;
};

export default ResultsTable;
