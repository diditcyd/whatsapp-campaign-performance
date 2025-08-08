
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CampaignData } from '@/lib/sampleData';

interface Props {
  data: (CampaignData & { team?: string })[];
  tokenCost: number;
}

const CostTable = ({ data, tokenCost }: Props) => {
  // Aggregate by team + campaign
  const aggregated = data.reduce((acc, item: any) => {
    const key = `${item.team ?? 'Unknown'}|${item.campaignId}`;
    if (!acc[key]) {
      acc[key] = {
        team: item.team ?? 'Unknown',
        campaignId: item.campaignId,
        tokens: 0,
        cost: 0,
        attempted: 0,
        delivered: 0,
        read: 0,
        responded: 0,
      };
    }
    acc[key].tokens += item.tokensUsed;
    acc[key].cost += item.tokensUsed * tokenCost;
    acc[key].attempted += item.attempted;
    acc[key].delivered += item.delivered;
    acc[key].read += item.read;
    acc[key].responded += item.responded;
    return acc;
  }, {} as Record<string, any>);

  const rows = Object.values(aggregated).sort((a: any, b: any) => b.cost - a.cost);

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Cost Breakdown by Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Team</TableHead>
                <TableHead className="font-semibold">Campaign</TableHead>
                <TableHead className="font-semibold text-right">Tokens Used</TableHead>
                <TableHead className="font-semibold text-right">Total Cost (IDR)</TableHead>
                <TableHead className="font-semibold text-right">Attempted</TableHead>
                <TableHead className="font-semibold text-right">Delivered</TableHead>
                <TableHead className="font-semibold text-right">Read</TableHead>
                <TableHead className="font-semibold text-right">Replied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r: any) => (
                <TableRow key={`${r.team}-${r.campaignId}`} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">{r.team}</TableCell>
                  <TableCell className="text-gray-700">{r.campaignId}</TableCell>
                  <TableCell className="text-right font-medium">{r.tokens.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">IDR {r.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{r.attempted.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{r.delivered.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{r.read.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{r.responded.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostTable;
