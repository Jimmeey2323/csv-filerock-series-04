
              {/* New member data in overview tab */}
              <Card className="shadow-sm border-muted/60 animate-fade-in" style={{ animationDelay: '450ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-primary" />
                    New Members Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.newClientDetails && data.newClientDetails.length > 0 ? (
                    <div className="max-h-80 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>First Visit</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.newClientDetails.slice(0, 5).map((client, idx) => (
                            <TableRow key={`${client.email}-${idx}`}>
                              <TableCell>{client.name || client.customerName || 'N/A'}</TableCell>
                              <TableCell>{client.email || 'N/A'}</TableCell>
                              <TableCell>{safeFormatDate(client.firstVisit || client.date)}</TableCell>
                              <TableCell>{client.source || 'Direct'}</TableCell>
                              <TableCell>
                                <Badge variant="modern">New</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No new member data available
                    </div>
                  )}
                </CardContent>
              </Card>
