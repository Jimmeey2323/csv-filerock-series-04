import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { safeFormatCurrency, safeToFixed } from '@/lib/utils';
import { DollarSign, Package, MapPin, Calendar, TrendingUp, TrendingDown, Award, Target } from 'lucide-react';

interface SalesMetricsViewProps {
  data: ProcessedTeacherData[];
  paymentsData: any[];
}

interface SalesMetrics {
  totalRevenue: number;
  totalTransactions: number;
  totalUnits: number;
  averageTransactionValue: number;
  averageUnitValue: number;
  unitsPerTransaction: number;
}

interface ProductSales {
  product: string;
  category: string;
  revenue: number;
  transactions: number;
  units: number;
  avgTransactionValue: number;
  avgUnitValue: number;
  upt: number;
}

interface LocationSales {
  location: string;
  revenue: number;
  transactions: number;
  units: number;
  avgTransactionValue: number;
  avgUnitValue: number;
  upt: number;
}

interface PeriodSales {
  period: string;
  revenue: number;
  transactions: number;
  units: number;
  avgTransactionValue: number;
  avgUnitValue: number;
  upt: number;
}

const SalesMetricsView: React.FC<SalesMetricsViewProps> = ({ data, paymentsData }) => {
  // Clean and normalize product names
  const cleanProductName = (product: string): string => {
    if (!product) return 'Unknown';
    return product
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s-]/g, '')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Extract category from product name
  const extractCategory = (product: string): string => {
    const cleaned = cleanProductName(product);
    if (cleaned.includes('Class') || cleaned.includes('Session')) return 'Classes';
    if (cleaned.includes('Package') || cleaned.includes('Bundle')) return 'Packages';
    if (cleaned.includes('Membership')) return 'Memberships';
    if (cleaned.includes('Retail') || cleaned.includes('Product')) return 'Retail';
    if (cleaned.includes('Workshop') || cleaned.includes('Event')) return 'Events';
    return 'Other';
  };

  // Process payments data by month
  const salesByMonth = useMemo(() => {
    if (!paymentsData || !Array.isArray(paymentsData)) return {};

    const monthlyData: Record<string, {
      products: Record<string, ProductSales>;
      categories: Record<string, ProductSales>;
      locations: Record<string, LocationSales>;
      totals: SalesMetrics;
    }> = {};

    paymentsData.forEach(payment => {
      const date = payment.Date || payment.date || payment['Payment Date'] || payment['Transaction Date'];
      const product = cleanProductName(payment.Product || payment.Item || payment['Product Name'] || 'Unknown');
      const category = extractCategory(product);
      const location = payment.Location || payment.Studio || payment['Studio Location'] || 'Unknown';
      const revenue = parseFloat(payment.Price || payment.Amount || payment.Revenue || payment.Value || 0);
      const quantity = parseInt(payment.Quantity || payment.Units || payment.Qty || 1);

      if (!date || revenue <= 0) return;

      const month = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      if (!monthlyData[month]) {
        monthlyData[month] = {
          products: {},
          categories: {},
          locations: {},
          totals: {
            totalRevenue: 0,
            totalTransactions: 0,
            totalUnits: 0,
            averageTransactionValue: 0,
            averageUnitValue: 0,
            unitsPerTransaction: 0
          }
        };
      }

      // Update product sales
      if (!monthlyData[month].products[product]) {
        monthlyData[month].products[product] = {
          product,
          category,
          revenue: 0,
          transactions: 0,
          units: 0,
          avgTransactionValue: 0,
          avgUnitValue: 0,
          upt: 0
        };
      }

      monthlyData[month].products[product].revenue += revenue;
      monthlyData[month].products[product].transactions += 1;
      monthlyData[month].products[product].units += quantity;

      // Update category sales
      if (!monthlyData[month].categories[category]) {
        monthlyData[month].categories[category] = {
          product: category,
          category,
          revenue: 0,
          transactions: 0,
          units: 0,
          avgTransactionValue: 0,
          avgUnitValue: 0,
          upt: 0
        };
      }

      monthlyData[month].categories[category].revenue += revenue;
      monthlyData[month].categories[category].transactions += 1;
      monthlyData[month].categories[category].units += quantity;

      // Update location sales
      if (!monthlyData[month].locations[location]) {
        monthlyData[month].locations[location] = {
          location,
          revenue: 0,
          transactions: 0,
          units: 0,
          avgTransactionValue: 0,
          avgUnitValue: 0,
          upt: 0
        };
      }

      monthlyData[month].locations[location].revenue += revenue;
      monthlyData[month].locations[location].transactions += 1;
      monthlyData[month].locations[location].units += quantity;

      // Update totals
      monthlyData[month].totals.totalRevenue += revenue;
      monthlyData[month].totals.totalTransactions += 1;
      monthlyData[month].totals.totalUnits += quantity;
    });

    // Calculate averages and UPT
    Object.keys(monthlyData).forEach(month => {
      const monthData = monthlyData[month];

      // Calculate totals averages
      monthData.totals.averageTransactionValue = monthData.totals.totalTransactions > 0 
        ? monthData.totals.totalRevenue / monthData.totals.totalTransactions 
        : 0;
      monthData.totals.averageUnitValue = monthData.totals.totalUnits > 0 
        ? monthData.totals.totalRevenue / monthData.totals.totalUnits 
        : 0;
      monthData.totals.unitsPerTransaction = monthData.totals.totalTransactions > 0 
        ? monthData.totals.totalUnits / monthData.totals.totalTransactions 
        : 0;

      // Calculate product averages
      Object.values(monthData.products).forEach(product => {
        product.avgTransactionValue = product.transactions > 0 ? product.revenue / product.transactions : 0;
        product.avgUnitValue = product.units > 0 ? product.revenue / product.units : 0;
        product.upt = product.transactions > 0 ? product.units / product.transactions : 0;
      });

      // Calculate category averages
      Object.values(monthData.categories).forEach(category => {
        category.avgTransactionValue = category.transactions > 0 ? category.revenue / category.transactions : 0;
        category.avgUnitValue = category.units > 0 ? category.revenue / category.units : 0;
        category.upt = category.transactions > 0 ? category.units / category.transactions : 0;
      });

      // Calculate location averages
      Object.values(monthData.locations).forEach(location => {
        location.avgTransactionValue = location.transactions > 0 ? location.revenue / location.transactions : 0;
        location.avgUnitValue = location.units > 0 ? location.revenue / location.units : 0;
        location.upt = location.transactions > 0 ? location.units / location.transactions : 0;
      });
    });

    return monthlyData;
  }, [paymentsData]);

  // Get all months sorted
  const allMonths = useMemo(() => {
    return Object.keys(salesByMonth).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [salesByMonth]);

  // Get top and bottom performers for each month
  const getTopBottomPerformers = (month: string, type: 'products' | 'locations') => {
    const monthData = salesByMonth[month];
    if (!monthData) return { top10: [], bottom10: [] };

    const items = Object.values(type === 'products' ? monthData.products : monthData.locations);
    const sorted = items.sort((a, b) => b.revenue - a.revenue);

    return {
      top10: sorted.slice(0, 10),
      bottom10: sorted.slice(-10).reverse()
    };
  };

  // Render sales table
  const renderSalesTable = (items: any[], type: 'product' | 'category' | 'location', title: string) => {
    if (!items || items.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">No data available</p>
          </CardContent>
        </Card>
      );
    }

    const sortedItems = items.sort((a, b) => b.revenue - a.revenue);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {type === 'product' && <Package className="h-5 w-5" />}
            {type === 'category' && <Target className="h-5 w-5" />}
            {type === 'location' && <MapPin className="h-5 w-5" />}
            {title}
            <Badge variant="outline">{sortedItems.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table maxHeight="400px">
            <TableHeader>
              <TableRow>
                <TableHead>{type === 'location' ? 'Location' : type === 'category' ? 'Category' : 'Product'}</TableHead>
                {type === 'product' && <TableHead>Category</TableHead>}
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Avg Transaction</TableHead>
                <TableHead className="text-right">Avg Unit Value</TableHead>
                <TableHead className="text-right">UPT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {type === 'location' ? item.location : item.product}
                  </TableCell>
                  {type === 'product' && <TableCell>{item.category}</TableCell>}
                  <TableCell className="text-right font-medium">
                    {safeFormatCurrency(item.revenue)}
                  </TableCell>
                  <TableCell className="text-right">{item.transactions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.units.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{safeFormatCurrency(item.avgTransactionValue)}</TableCell>
                  <TableCell className="text-right">{safeFormatCurrency(item.avgUnitValue)}</TableCell>
                  <TableCell className="text-right">{safeToFixed(item.upt, 2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  // Early return if no payments data
  if (!paymentsData || !Array.isArray(paymentsData) || paymentsData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No payments data available for sales metrics analysis.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allMonths = Object.keys(salesByMonth).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (allMonths.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No sales data available for the selected period.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="performers">Top/Bottom Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            {allMonths.map(month => {
              const monthData = salesByMonth[month];
              if (!monthData) return null;

              return (
                <Card key={month}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {month} - Sales Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Total Revenue
                        </div>
                        <div className="text-2xl font-semibold">
                          {safeFormatCurrency(monthData.totals.totalRevenue)}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Transactions</div>
                        <div className="text-2xl font-semibold">
                          {monthData.totals.totalTransactions.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Units Sold</div>
                        <div className="text-2xl font-semibold">
                          {monthData.totals.totalUnits.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Avg Transaction</div>
                        <div className="text-2xl font-semibold">
                          {safeFormatCurrency(monthData.totals.averageTransactionValue)}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">Avg Unit Value</div>
                        <div className="text-2xl font-semibold">
                          {safeFormatCurrency(monthData.totals.averageUnitValue)}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">UPT</div>
                        <div className="text-2xl font-semibold">
                          {safeToFixed(monthData.totals.unitsPerTransaction, 2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-6">
            {allMonths.map(month => {
              const monthData = salesByMonth[month];
              if (!monthData) return null;

              return (
                <div key={month}>
                  <h3 className="text-lg font-semibold mb-4">{month}</h3>
                  {renderSalesTable(Object.values(monthData.products), 'product', 'Sales by Product')}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-6">
            {allMonths.map(month => {
              const monthData = salesByMonth[month];
              if (!monthData) return null;

              return (
                <div key={month}>
                  <h3 className="text-lg font-semibold mb-4">{month}</h3>
                  {renderSalesTable(Object.values(monthData.categories), 'category', 'Sales by Category')}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="locations">
          <div className="space-y-6">
            {allMonths.map(month => {
              const monthData = salesByMonth[month];
              if (!monthData) return null;

              return (
                <div key={month}>
                  <h3 className="text-lg font-semibold mb-4">{month}</h3>
                  {renderSalesTable(Object.values(monthData.locations), 'location', 'Sales by Location')}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performers">
          <div className="space-y-6">
            {allMonths.map(month => {
              const productPerformers = getTopBottomPerformers(month, 'products');
              const locationPerformers = getTopBottomPerformers(month, 'locations');

              return (
                <div key={month} className="space-y-4">
                  <h3 className="text-lg font-semibold">{month}</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top 10 Products */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          Top 10 Products
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table maxHeight="300px">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rank</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                              <TableHead className="text-right">Transactions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productPerformers.top10.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Badge variant={index < 3 ? "default" : "secondary"}>
                                    #{index + 1}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{product.product}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {safeFormatCurrency(product.revenue)}
                                </TableCell>
                                <TableCell className="text-right">{product.transactions}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* Bottom 10 Products */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-red-600" />
                          Bottom 10 Products
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table maxHeight="300px">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                              <TableHead className="text-right">Transactions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productPerformers.bottom10.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{product.product}</TableCell>
                                <TableCell className="text-right">
                                  {safeFormatCurrency(product.revenue)}
                                </TableCell>
                                <TableCell className="text-right">{product.transactions}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* Top 10 Locations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-gold-600" />
                          Top 10 Locations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table maxHeight="300px">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rank</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                              <TableHead className="text-right">Transactions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {locationPerformers.top10.map((location, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Badge variant={index < 3 ? "default" : "secondary"}>
                                    #{index + 1}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{location.location}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {safeFormatCurrency(location.revenue)}
                                </TableCell>
                                <TableCell className="text-right">{location.transactions}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* Bottom 10 Locations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-red-600" />
                          Bottom 10 Locations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table maxHeight="300px">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Location</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                              <TableHead className="text-right">Transactions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {locationPerformers.bottom10.map((location, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{location.location}</TableCell>
                                <TableCell className="text-right">
                                  {safeFormatCurrency(location.revenue)}
                                </TableCell>
                                <TableCell className="text-right">{location.transactions}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesMetricsView;
