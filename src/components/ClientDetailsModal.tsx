
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
          <div className="bg-secondary/30 rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              Total Revenue
            </p>
            <p className="font-medium">{formatCurrency(totalValue)}</p>
          </div>
          <div className="bg-secondary/30 rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1 flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              Avg. Revenue per Client
            </p>
            <p className="font-medium">{formatCurrency(avgValue)}</p>
          </div>
          {topMembership && (
            <div className="bg-secondary/30 rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                Top Membership
              </p>
              <p className="font-medium truncate" title={topMembership[0]}>
                {topMembership[0].substring(0, 20)}{topMembership[0].length > 20 ? '...' : ''} ({topMembership[1]})
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
          <div className="bg-secondary/30 rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1 flex items-center">
              <Hash className="h-3 w-3 mr-1" />
              Total Visits
            </p>
            <p className="font-medium">{totalVisits}</p>
          </div>
          <div className="bg-secondary/30 rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1 flex items-center">
              <Hash className="h-3 w-3 mr-1" />
              Avg. Visits per Client
            </p>
            <p className="font-medium">{avgVisits.toFixed(1)}</p>
          </div>
          <div className="bg-secondary/30 rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1 flex items-center">
              <Hash className="h-3 w-3 mr-1" />
              Max Visits
            </p>
            <p className="font-medium">{maxVisits}</p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const getStatusBadge = () => {
    if (type === 'new') return <Badge className="bg-blue-500">New</Badge>;
    if (type === 'retained') return <Badge className="bg-green-500">Retained</Badge>;
    if (type === 'converted') return <Badge className="bg-purple-500">Converted</Badge>;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {title} {getStatusBadge()}
            </DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {getSummaryStats()}
        
        <ScrollArea className="flex-1 h-[50vh] border rounded-md overflow-auto">
          <div className="min-w-full">
            <Table>
              <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead className="w-1/4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3.5 w-3.5" />
                      <span>Name</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-1/4">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-1/5">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{type === 'new' ? 'First Visit' : type === 'retained' ? 'Return Visit' : 'Purchase'} Date</span>
                    </div>
                  </TableHead>
                  {type === 'retained' && (
                    <TableHead className="w-1/6 text-right">
                      <div className="flex items-center space-x-1 justify-end">
                        <Hash className="h-3.5 w-3.5" />
                        <span>Visits</span>
                      </div>
                    </TableHead>
                  )}
                  {type === 'converted' && (
                    <>
                      <TableHead className="w-1/6 text-right">
                        <div className="flex items-center space-x-1 justify-end">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>Value</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-1/5">
                        <div className="flex items-center space-x-1">
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
                  <TableRow key={index} className="hover:bg-secondary/30">
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="font-mono text-xs">{client.email}</TableCell>
                    <TableCell>{formatDate(client.date)}</TableCell>
                    {type === 'retained' && (
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                          {client.visitCount || '-'}
                        </Badge>
                      </TableCell>
                    )}
                    {type === 'converted' && (
                      <>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(client.value)}
                        </TableCell>
                        <TableCell className="truncate max-w-[150px]" title={client.membershipType}>
                          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 font-normal">
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
        
        <DialogFooter className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'}
          </div>
          <Button onClick={downloadCSV} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;
