// src/components/faculty/EmptyState.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User2 } from 'lucide-react';

export default function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-14 text-center">
        <User2 className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="mt-3 font-medium">No requests found</p>
        <p className="text-sm text-muted-foreground">Try adjusting filters or search.</p>
      </CardContent>
    </Card>
  );
}
