
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { CampaignData } from '@/lib/sampleData';

interface Props {
  data: (CampaignData & { team?: string })[];
  tokenCost: number;
}

const CostOverTimeChart = ({ data, tokenCost }: Props) => {
  const daily = data.reduce((acc, item) => {
    const date = format(parseISO(item.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = { date, cost: 0, tokens: 0 };
    acc[date].tokens += item.tokensUsed;
    acc[date].cost += item.tokensUsed * tokenCost;
    return acc;
  }, {} as Record<string, { date: string; cost: number; tokens: number }>);

  const chartData = Object.values(daily).map((d) => ({
    date: format(parseISO(d.date), 'MMM dd'),
    cost: d.cost,
    tokens: d.tokens,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Cost' ? `IDR ${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Cost Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 420 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={3} name="Cost" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostOverTimeChart;
