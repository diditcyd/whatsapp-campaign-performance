
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { generateSampleData, type CampaignData } from '@/lib/sampleData';
import CostOverTimeChart from '@/components/CostOverTimeChart';
import CostByTeamChart from '@/components/CostByTeamChart';
import CostTable from '@/components/CostTable';

const TOKEN_COST_IDR = 15; // IDR per token

const TEAM_MAP: Record<string, 'CRM' | 'Digital Support' | 'DMS'> = {
  'CAMP-001': 'CRM',
  'CAMP-002': 'Digital Support',
  'CAMP-003': 'DMS',
  'CAMP-004': 'CRM',
  'CAMP-005': 'Digital Support',
};

const CostDashboard = () => {
  const [selectedCampaignType, setSelectedCampaignType] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2024, 5, 1),
    to: new Date(2024, 6, 3),
  });

  useEffect(() => {
    document.title = 'WhatsApp Cost Tracking Dashboard | IDR';
  }, []);

  // Load and extend data with team mapping
  const rawData = useMemo(() => generateSampleData(), []);
  const dataWithTeam = useMemo(() => {
    return rawData.map((d) => ({
      ...d,
      team: TEAM_MAP[d.campaignId] ?? 'CRM',
    }));
  }, [rawData]);

  // Filters
  const filteredData = useMemo(() => {
    return dataWithTeam.filter((item) => {
      const itemDate = new Date(item.timestamp);
      const matchesType = selectedCampaignType === 'all' || item.campaignType === (selectedCampaignType as CampaignData['campaignType']);
      const matchesTeam = selectedTeam === 'all' || item.team === selectedTeam;
      const matchesDateRange = (!dateRange.from || itemDate >= dateRange.from) && (!dateRange.to || itemDate <= dateRange.to);
      return matchesType && matchesTeam && matchesDateRange;
    });
  }, [dataWithTeam, selectedCampaignType, selectedTeam, dateRange]);

  // KPIs
  const { totalTokens, totalCost, totalDelivered, avgCostPerDelivered } = useMemo(() => {
    const totalTokens = filteredData.reduce((sum, d) => sum + d.tokensUsed, 0);
    const totalCost = totalTokens * TOKEN_COST_IDR;
    const totalDelivered = filteredData.reduce((sum, d) => sum + d.delivered, 0);
    const avgCostPerDelivered = totalDelivered ? totalCost / totalDelivered : 0;
    return { totalTokens, totalCost, totalDelivered, avgCostPerDelivered };
  }, [filteredData]);

  const handleTeamSelect = (team: string) => setSelectedTeam((prev) => (prev === team ? 'all' : team));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            WhatsApp Cost Tracking Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Monitor costs at a glance and drill down by team and campaign</p>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Campaign Type</label>
              <Select value={selectedCampaignType} onValueChange={setSelectedCampaignType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Automation">Automation</SelectItem>
                  <SelectItem value="Campaign">Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="CRM">CRM</SelectItem>
                  <SelectItem value="Digital Support">Digital Support</SelectItem>
                  <SelectItem value="DMS">DMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-64 justify-start text-left font-normal', !dateRange.from && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) setDateRange({ from: range.from, to: range.to });
                    }}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="text-sm text-gray-600">Total Cost</div>
            <div className="text-3xl font-bold">IDR {totalCost.toLocaleString()}</div>
          </Card>
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="text-sm text-gray-600">Tokens Used</div>
            <div className="text-3xl font-bold">{totalTokens.toLocaleString()}</div>
          </Card>
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="text-sm text-gray-600">Delivered</div>
            <div className="text-3xl font-bold">{totalDelivered.toLocaleString()}</div>
          </Card>
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="text-sm text-gray-600">Avg Cost / Delivered</div>
            <div className="text-3xl font-bold">IDR {avgCostPerDelivered.toFixed(2)}</div>
          </Card>
        </div>

        {/* Charts */}
        <CostOverTimeChart data={filteredData} tokenCost={TOKEN_COST_IDR} />
        <CostByTeamChart data={filteredData} tokenCost={TOKEN_COST_IDR} selectedTeam={selectedTeam} onSelectTeam={handleTeamSelect} />

        {/* Table */}
        <CostTable data={filteredData} tokenCost={TOKEN_COST_IDR} />
      </div>
    </div>
  );
};

export default CostDashboard;
