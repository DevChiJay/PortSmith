import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, BookOpen } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <Link href="/dashboard/my-keys" className="block">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create New API Key
            </Button>
          </Link>
          <Link href="/dashboard/available-apis" className="block">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Search className="h-4 w-4 mr-2" />
              Browse Available APIs
            </Button>
          </Link>
          <Link href="/dashboard/docs" className="block">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <BookOpen className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
