import type { ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

interface ActionItemsTableProps {
  items: ExtractActionItemsOutput;
}

export default function ActionItemsTable({ items }: ActionItemsTableProps) {
  const formatDate = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        return format(date, 'MMM d, yyyy');
    } catch (error) {
        return dateString; // Return original string if parsing fails
    }
  }

  const importanceOrder: { [key: string]: number } = {
    "High": 1,
    "Medium": 2,
    "Low": 3
  };

  const sortedItems = [...items].sort((a, b) => {
    // Sort by importance
    const importanceA = importanceOrder[a.importance] || 4;
    const importanceB = importanceOrder[b.importance] || 4;
    if (importanceA !== importanceB) {
      return importanceA - importanceB;
    }
    
    // If importance is the same, sort by deadline
    try {
      const dateA = parseISO(a.deadline).getTime();
      const dateB = parseISO(b.deadline).getTime();
      return dateA - dateB;
    } catch (error) {
        return 0;
    }
  });
  
  const getImportanceVariant = (importance: string) => {
    switch(importance.toLowerCase()) {
        case 'high': return 'destructive';
        case 'medium': return 'default';
        case 'low': return 'secondary';
        default: return 'outline';
    }
  }

  return (
    <div className="rounded-md border">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead className="w-[50%]">Task</TableHead>
            <TableHead>Importance</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead className="text-right">Deadline</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sortedItems.map((item, index) => (
            <TableRow key={index}>
                <TableCell className="font-medium">{item.task}</TableCell>
                <TableCell>
                    <Badge variant={getImportanceVariant(item.importance)}>{item.importance}</Badge>
                </TableCell>
                <TableCell>
                    <Badge variant="secondary">{item.assignee}</Badge>
                </TableCell>
                <TableCell className="text-right">{formatDate(item.deadline)}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
