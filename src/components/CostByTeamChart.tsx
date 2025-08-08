
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { CampaignData } from '@/lib/sampleData';

interface Props {
  data: (CampaignData & { team?: string })[];
  tokenCost: number;
  selectedTeam: string;
  onSelectTeam: (team: string) => void;
}

const CostByTeamChart = ({ data, tokenCost, selectedTeam, onSelectTeam }: Props) => {
  const byTeam = data.reduce((acc, item: any) => {
    const team = item.team ?? 'Unknown';
    if (!acc[team]) acc[team] = { team, cost: 0, tokens: 0 };
    acc[team].tokens += item.tokensUsed;
    acc[team].cost += item.tokensUsed * tokenCost;
    return acc;
  }, {} as Record<string, { team: string; cost: number; tokens: number }>);

  const chartData = Object.values(byTeam).sort((a, b) => b.cost - a.cost);

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Cost by Team</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 420 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="team" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip formatter={(value: any, name: string) => [name === 'Cost' ? `IDR ${Number(value).toLocaleString()}` : Number(value).toLocaleString(), name]} />
              <Bar
                dataKey="cost"
                name="Cost"
                fill={selectedTeam === 'all' ? '#10b981' : '#3b82f6'}
                radius={[6, 6, 0, 0]}
                onClick={(data) => onSelectTeam((data as any).team)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">Tip: click a bar to filter by team. Click again to clear.</p>
      </CardContent>
    </Card>
  );
};

export default CostByTeamChart;
