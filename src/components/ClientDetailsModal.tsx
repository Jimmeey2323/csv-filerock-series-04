
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
import { Download } from 'lucide-react';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[50vh] border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm">
              <TableRow>
                <TableHead className="w-1/4">Name</TableHead>
                <TableHead className="w-1/4">Email</TableHead>
                <TableHead className="w-1/5">{type === 'new' ? 'First Visit' : type === 'retained' ? 'Return Visit' : 'Purchase'} Date</TableHead>
                {type === 'retained' && <TableHead className="w-1/6 text-right">Visits</TableHead>}
                {type === 'converted' && (
                  <>
                    <TableHead className="w-1/6 text-right">Value</TableHead>
                    <TableHead className="w-1/5">Membership</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{formatDate(client.date)}</TableCell>
                  {type === 'retained' && <TableCell className="text-right">{client.visitCount || '-'}</TableCell>}
                  {type === 'converted' && (
                    <>
                      <TableCell className="text-right">{formatCurrency(client.value)}</TableCell>
                      <TableCell className="truncate max-w-[150px]" title={client.membershipType}>
                        {client.membershipType || '-'}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'}
          </div>
          <Button onClick={downloadCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;
