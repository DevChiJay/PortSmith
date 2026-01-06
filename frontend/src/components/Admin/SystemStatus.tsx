import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SystemStatusProps {
  services?: Array<{
    name: string;
    description: string;
    status: 'operational' | 'degraded' | 'down';
  }>;
}

const defaultServices = [
  { name: 'Database', description: 'MongoDB Atlas', status: 'operational' as const },
  { name: 'API Gateway', description: 'Request routing', status: 'operational' as const },
  { name: 'Authentication', description: 'JWT + OAuth', status: 'operational' as const },
];

export function SystemStatus({ services = defaultServices }: SystemStatusProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge variant="default" className="bg-green-500">Operational</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-500">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Platform health and performance indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="text-sm font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
              </div>
              {getStatusBadge(service.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
