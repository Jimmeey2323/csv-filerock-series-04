
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';
import { ProcessedTeacherData } from '@/utils/dataProcessor';

interface DataCardsViewProps {
  data: ProcessedTeacherData[];
}

const DataCardsView: React.FC<DataCardsViewProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No data to display in cards view
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              {item.teacherName}
              <Badge variant="outline">{item.location}</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{item.period}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">New:</span> {item.newClients}
              </div>
              <div>
                <span className="font-medium">Converted:</span> {item.convertedClients}
              </div>
              <div>
                <span className="font-medium">Retained:</span> {item.retainedClients}
              </div>
              <div>
                <span className="font-medium">Revenue:</span> {safeFormatCurrency(item.totalRevenue)}
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conv: {safeToFixed(item.conversionRate, 1)}%</span>
                <span>Ret: {safeToFixed(item.retentionRate, 1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DataCardsView;
