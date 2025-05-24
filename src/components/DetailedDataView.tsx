
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';
import { ProcessedTeacherData } from '@/utils/dataProcessor';

interface DetailedDataViewProps {
  data: ProcessedTeacherData[];
}

const DetailedDataView: React.FC<DetailedDataViewProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No data to display in detailed view
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <Card key={index} className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{item.teacherName}</span>
              <div className="flex gap-2">
                <Badge variant="outline">{item.location}</Badge>
                <Badge variant="secondary">{item.period}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Client Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>New Clients:</span>
                    <span className="font-medium">{item.newClients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Converted:</span>
                    <span className="font-medium text-green-600">{item.convertedClients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retained:</span>
                    <span className="font-medium text-blue-600">{item.retainedClients}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Conversion Rate:</span>
                    <span className="font-medium">{safeToFixed(item.conversionRate, 1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention Rate:</span>
                    <span className="font-medium">{safeToFixed(item.retentionRate, 1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Revenue/Client:</span>
                    <span className="font-medium">{safeFormatCurrency(item.averageRevenuePerClient)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Revenue</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-medium text-green-600">{safeFormatCurrency(item.totalRevenue)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Sources</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Trials:</span>
                    <span className="font-medium">{item.trials}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Referrals:</span>
                    <span className="font-medium">{item.referrals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hosted:</span>
                    <span className="font-medium">{item.hosted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Influencer:</span>
                    <span className="font-medium">{item.influencerSignups}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Others:</span>
                    <span className="font-medium">{item.others}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DetailedDataView;
