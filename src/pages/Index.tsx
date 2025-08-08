
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import KpiCards from '@/components/KpiCards';
import FailureReasonsChart from '@/components/FailureReasonsChart';
import PerformanceOverTimeChart from '@/components/PerformanceOverTimeChart';
import EngagementFunnelChart from '@/components/EngagementFunnelChart';
import CampaignTable from '@/components/CampaignTable';
import { generateSampleData } from '@/lib/sampleData';
import { Link } from 'react-router-dom';
const Index = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedCampaignType, setSelectedCampaignType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(2024, 5, 1),
    to: new Date(2024, 6, 3),
  });

  // Generate sample data
  const rawData = useMemo(() => generateSampleData(), []);
  
  // Filter data based on selected campaign, campaign type and date range
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      const itemDate = new Date(item.timestamp);
      const matchesCampaign = selectedCampaign === 'all' || item.campaignId === selectedCampaign;
      const matchesCampaignType = selectedCampaignType === 'all' || item.campaignType === selectedCampaignType;
      const matchesDateRange = (!dateRange.from || itemDate >= dateRange.from) && 
                              (!dateRange.to || itemDate <= dateRange.to);
      return matchesCampaign && matchesCampaignType && matchesDateRange;
    });
  }, [rawData, selectedCampaign, selectedCampaignType, dateRange]);

  // Get unique campaign IDs for dropdown
  const campaigns = useMemo(() => {
    const uniqueCampaigns = Array.from(new Set(rawData.map(item => item.campaignId)));
    return uniqueCampaigns.sort();
  }, [rawData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            WhatsApp Broadcast Campaign Overview
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor delivery rates, engagement metrics, and campaign performance
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/cost">Open Cost Dashboard</Link>
          </Button>
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
              <label className="text-sm font-medium text-gray-700">Campaign</label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign} value={campaign}>
                      {campaign}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-64 justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
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
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
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
        <KpiCards data={filteredData} />

        {/* Performance Over Time - Full Width */}
        <PerformanceOverTimeChart data={filteredData} />

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Engagement Funnel */}
          <EngagementFunnelChart data={filteredData} />

          {/* Right Column - Failure Reasons */}
          <FailureReasonsChart data={filteredData} />
        </div>

        {/* Campaign Table - Full Width */}
        <CampaignTable data={filteredData} />
      </div>
    </div>
  );
};

export default Index;
