
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Mail, User, Calendar, Hash, DollarSign, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClientDetail {
  email: string;
  name: string;
  date: string;
  value?: number;
  visitCount?: number;
  membershipType?: string;
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  clients: ClientDetail[];
  type: 'new' | 'retained' | 'converted';
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  clients,
  type
}) => {
  if (!clients || clients.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
    return `₹${value.toLocaleString()}`;
  };

  const downloadCSV = () => {
    // Create headers based on client type
    let headers = ['Name', 'Email', 'Date'];
    if (type === 'retained') headers.push('Visit Count');
    if (type === 'converted') headers.push('Value', 'Membership Type');
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...clients.map(client => {
        const row = [
          `"${client.name}"`,
          `"${client.email}"`,
          formatDate(client.date)
        ];
        
        if (type === 'retained' && client.visitCount !== undefined) row.push(client.visitCount.toString());
        if (type === 'converted') {
          if (client.value !== undefined) row.push(client.value.toString());
          if (client.membershipType) row.push(`"${client.membershipType}"`);
        }
        
        return row.join(',');
      })
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '-').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get summary stats for the modal
  const getSummaryStats = () => {
    if (type === 'converted') {
      const totalValue = clients.reduce((sum, client) => sum + (client.value || 0), 0);
      const avgValue = totalValue / clients.length;
      
      // Get membership type distribution
      const membershipTypes = clients.reduce((acc, client) => {
        const type = client.membershipType || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topMembership = Object.entries(membershipTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 1)[0];
        
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm border border-blue-100 transition-transform hover:-translate-y-0.5 duration-300">
            <p className="text-xs text-blue-600 mb-1 flex items-center font-medium">
              <DollarSign className="h-3 w-3 mr-1" />
              Total Revenue
            </p>
            <p className="font-semibold text-lg gradient-text">{formatCurrency(totalValue)}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 shadow-sm border border-indigo-100 transition-transform hover:-translate-y-0.5 duration-300">
            <p className="text-xs text-indigo-600 mb-1 flex items-center font-medium">
              <DollarSign className="h-3 w-3 mr-1" />
              Avg. Revenue per Client
            </p>
            <p className="font-semibold text-lg gradient-text">{formatCurrency(avgValue)}</p>
          </div>
          {topMembership && (
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 shadow-sm border border-purple-100 transition-transform hover:-translate-y-0.5 duration-300">
              <p className="text-xs text-purple-600 mb-1 flex items-center font-medium">
                <Tag className="h-3 w-3 mr-1" />
                Top Membership
              </p>
              <p className="font-semibold text-lg truncate" title={topMembership[0]}>
                {topMembership[0].substring(0, 20)}{topMembership[0].length > 20 ? '...' : ''} 
                <span className="ml-1 text-sm font-normal text-slate-500">({topMembership[1]})</span>
              </p>
            </div>
          )}
        </div>
      );
    }
    
    if (type === 'retained') {
      const totalVisits = clients.reduce((sum, client) => sum + (client.visitCount || 0), 0);
      const avgVisits = totalVisits / clients.length;
      const maxVisits = Math.max(...clients.map(client => client.visitCount || 0));
      
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm border border-green-100 transition-transform hover:-translate-y-0.5 duration-300">
            <p className="text-xs text-green-600 mb-1 flex items-center font-medium">
              <Hash className="h-3 w-3 mr-1" />
              Total Visits
            </p>
            <p className="font-semibold text-lg gradient-text-3">{totalVisits}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 shadow-sm border border-emerald-100 transition-transform hover:-translate-y-0.5 duration-300">
            <p className="text-xs text-emerald-600 mb-1 flex items-center font-medium">
              <Hash className="h-3 w-3 mr-1" />
              Avg. Visits per Client
            </p>
            <p className="font-semibold text-lg gradient-text-3">{avgVisits.toFixed(1)}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 shadow-sm border border-teal-100 transition-transform hover:-translate-y-0.5 duration-300">
            <p className="text-xs text-teal-600 mb-1 flex items-center font-medium">
              <Hash className="h-3 w-3 mr-1" />
              Max Visits
            </p>
            <p className="font-semibold text-lg gradient-text-3">{maxVisits}</p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const getStatusBadge = () => {
    if (type === 'new') return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 ml-2 shadow-sm">New</Badge>;
    if (type === 'retained') return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 ml-2 shadow-sm">Retained</Badge>;
    if (type === 'converted') return <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 ml-2 shadow-sm">Converted</Badge>;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col bg-white/95 backdrop-blur-xl border-slate-200 shadow-premium animate-scale-in">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="gradient-text font-bold">{title}</span> {getStatusBadge()}
            </DialogTitle>
          </div>
          <DialogDescription className="mt-1 text-slate-600">{description}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {getSummaryStats()}
        </div>
        
        <ScrollArea className="flex-1 h-[50vh] border rounded-lg overflow-auto shadow-inner-top">
          <div className="min-w-full">
            <Table className="luxury-table">
              <TableHeader className="sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 shadow-sm">
                <TableRow className="border-slate-200">
                  <TableHead className="w-1/4">
                    <div className="flex items-center space-x-1 text-slate-600">
                      <User className="h-3.5 w-3.5" />
                      <span>Name</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-1/4">
                    <div className="flex items-center space-x-1 text-slate-600">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-1/5">
                    <div className="flex items-center space-x-1 text-slate-600">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{type === 'new' ? 'First Visit' : type === 'retained' ? 'Return Visit' : 'Purchase'} Date</span>
                    </div>
                  </TableHead>
                  {type === 'retained' && (
                    <TableHead className="w-1/6 text-right">
                      <div className="flex items-center space-x-1 justify-end text-slate-600">
                        <Hash className="h-3.5 w-3.5" />
                        <span>Visits</span>
                      </div>
                    </TableHead>
                  )}
                  {type === 'converted' && (
                    <>
                      <TableHead className="w-1/6 text-right">
                        <div className="flex items-center space-x-1 justify-end text-slate-600">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>Value</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-1/5">
                        <div className="flex items-center space-x-1 text-slate-600">
                          <Tag className="h-3.5 w-3.5" />
                          <span>Membership</span>
                        </div>
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client, index) => (
                  <TableRow key={index} className="animate-reveal-up stagger-animation">
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{client.email}</TableCell>
                    <TableCell>{formatDate(client.date)}</TableCell>
                    {type === 'retained' && (
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 shadow-sm">
                          {client.visitCount || '-'}
                        </Badge>
                      </TableCell>
                    )}
                    {type === 'converted' && (
                      <>
                        <TableCell className="text-right font-medium text-slate-700">
                          {formatCurrency(client.value)}
                        </TableCell>
                        <TableCell className="truncate max-w-[150px]" title={client.membershipType}>
                          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 font-normal shadow-sm">
                            {client.membershipType ? (client.membershipType.length > 15 ? client.membershipType.substring(0, 15) + '...' : client.membershipType) : '-'}
                          </Badge>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'}
          </div>
          <Button onClick={downloadCSV} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm button-hover">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;
