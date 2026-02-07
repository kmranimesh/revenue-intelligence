import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import * as d3 from 'd3';

interface SegmentData {
    segment: string;
    dealCount: number;
    totalValue: number;
    winRate: number;
    avgDeal: number;
    avgCycle: number;
}

interface MonthlyTrend {
    month: string;
    revenue: number;
    winRate: number;
    avgDeal: number;
    cycleTime: number;
}

interface DriversData {
    pipeline: { count: number; value: number };
    pipelineChange: number;
    winRate: number;
    winRateChange: number;
    averageDealSize: number;
    avgDealChange: number;
    salesCycleTime: number;
    cycleTimeChange: number;
    bySegment: SegmentData[];
    monthlyTrends: MonthlyTrend[];
}

function RevenueDrivers() {
    const [data, setData] = useState<DriversData | null>(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(250);

    useEffect(() => {
        fetch('/api/drivers')
            .then(res => res.json())
            .then(data => { setData(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setChartWidth(containerRef.current.offsetWidth - 40);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [loading]);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value}`;
    };

    const formatChange = (value: number, isDays = false) => {
        if (isDays) return value >= 0 ? `+${value} Days` : `${value} Days`;
        return value >= 0 ? `+${value}%` : `${value}%`;
    };

    const RevenueAreaChart = ({ trends }: { trends: MonthlyTrend[] }) => {
        const ref = useRef<SVGSVGElement>(null);
        useEffect(() => {
            if (!ref.current || chartWidth < 50 || trends.length === 0) return;
            const svg = d3.select(ref.current);
            svg.selectAll('*').remove();
            const h = 55;
            const values = trends.map(t => t.revenue);
            const maxVal = Math.max(...values) || 1;
            const x = d3.scaleLinear().domain([0, values.length - 1]).range([0, chartWidth]);
            const y = d3.scaleLinear().domain([0, maxVal]).range([h - 5, 5]);

            svg.append('line').attr('x1', 0).attr('x2', chartWidth).attr('y1', h - 1).attr('y2', h - 1).attr('stroke', '#e5e7eb').attr('stroke-width', 1);
            const area = d3.area<number>().x((_, i) => x(i)).y0(h - 1).y1(d => y(d)).curve(d3.curveMonotoneX);
            const line = d3.line<number>().x((_, i) => x(i)).y(d => y(d)).curve(d3.curveMonotoneX);
            svg.append('path').datum(values).attr('fill', 'rgba(191, 219, 254, 0.6)').attr('d', area);
            svg.append('path').datum(values).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 1.5).attr('d', line);
        }, [chartWidth, trends]);
        return <svg ref={ref} width={chartWidth} height={55} style={{ display: 'block' }} />;
    };

    const WinRateBarChart = ({ segments }: { segments: SegmentData[] }) => {
        const ref = useRef<SVGSVGElement>(null);
        useEffect(() => {
            if (!ref.current || chartWidth < 50 || segments.length === 0) return;
            const svg = d3.select(ref.current);
            svg.selectAll('*').remove();
            const h = 55;
            const x = d3.scaleBand().domain(segments.map(s => s.segment)).range([0, chartWidth]).padding(0.3);
            const y = d3.scaleLinear().domain([0, 100]).range([h - 5, 5]);

            svg.append('line').attr('x1', 0).attr('x2', chartWidth).attr('y1', h - 1).attr('y2', h - 1).attr('stroke', '#e5e7eb').attr('stroke-width', 1);
            svg.selectAll('rect').data(segments).join('rect')
                .attr('x', d => x(d.segment)!)
                .attr('y', d => y(d.winRate))
                .attr('width', x.bandwidth())
                .attr('height', d => (h - 5) - y(d.winRate))
                .attr('fill', '#3b82f6')
                .attr('rx', 2);
            svg.selectAll('text').data(segments).join('text')
                .attr('x', d => x(d.segment)! + x.bandwidth() / 2)
                .attr('y', h + 12)
                .attr('text-anchor', 'middle')
                .attr('font-size', '9px')
                .attr('fill', '#64748b')
                .text(d => d.segment.substring(0, 3));
        }, [chartWidth, segments]);
        return <svg ref={ref} width={chartWidth} height={70} style={{ display: 'block' }} />;
    };

    const AvgDealAreaChart = ({ trends }: { trends: MonthlyTrend[] }) => {
        const ref = useRef<SVGSVGElement>(null);
        useEffect(() => {
            if (!ref.current || chartWidth < 50 || trends.length === 0) return;
            const svg = d3.select(ref.current);
            svg.selectAll('*').remove();
            const h = 55;
            const values = trends.map(t => t.avgDeal);
            const maxVal = Math.max(...values) || 1;
            const x = d3.scaleLinear().domain([0, values.length - 1]).range([0, chartWidth]);
            const y = d3.scaleLinear().domain([0, maxVal]).range([h - 5, 5]);

            svg.append('line').attr('x1', 0).attr('x2', chartWidth).attr('y1', h - 1).attr('y2', h - 1).attr('stroke', '#e5e7eb').attr('stroke-width', 1);
            const area = d3.area<number>().x((_, i) => x(i)).y0(h - 1).y1(d => y(d)).curve(d3.curveMonotoneX);
            const line = d3.line<number>().x((_, i) => x(i)).y(d => y(d)).curve(d3.curveMonotoneX);
            svg.append('path').datum(values).attr('fill', 'rgba(191, 219, 254, 0.6)').attr('d', area);
            svg.append('path').datum(values).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 1.5).attr('d', line);
        }, [chartWidth, trends]);
        return <svg ref={ref} width={chartWidth} height={55} style={{ display: 'block' }} />;
    };

    const CycleTimeLineChart = ({ trends }: { trends: MonthlyTrend[] }) => {
        const ref = useRef<SVGSVGElement>(null);
        useEffect(() => {
            if (!ref.current || chartWidth < 50 || trends.length === 0) return;
            const svg = d3.select(ref.current);
            svg.selectAll('*').remove();
            const h = 55;
            const values = trends.map(t => t.cycleTime);
            const maxVal = Math.max(...values) || 1;
            const x = d3.scaleLinear().domain([0, values.length - 1]).range([10, chartWidth - 10]);
            const y = d3.scaleLinear().domain([0, maxVal * 1.2]).range([h - 10, 10]);

            svg.append('line').attr('x1', 0).attr('x2', chartWidth).attr('y1', h - 1).attr('y2', h - 1).attr('stroke', '#e5e7eb').attr('stroke-width', 1);
            const line = d3.line<number>().x((_, i) => x(i)).y(d => y(d)).curve(d3.curveMonotoneX);
            svg.append('path').datum(values).attr('fill', 'none').attr('stroke', '#f97316').attr('stroke-width', 1.5).attr('d', line);
            svg.selectAll('circle').data(values).join('circle')
                .attr('cx', (_, i) => x(i)).attr('cy', d => y(d))
                .attr('r', 3).attr('fill', 'white').attr('stroke', '#f97316').attr('stroke-width', 1.5);
        }, [chartWidth, trends]);
        return <svg ref={ref} width={chartWidth} height={55} style={{ display: 'block' }} />;
    };

    if (loading) {
        return <Card sx={{ bgcolor: 'white', height: '100%' }}><CardContent><Skeleton variant="rectangular" height={400} /></CardContent></Card>;
    }

    if (!data) return null;

    const metrics = [
        { label: 'Pipeline Value', value: formatCurrency(data.pipeline.value), change: formatChange(data.pipelineChange), positive: data.pipelineChange >= 0, chart: <RevenueAreaChart trends={data.monthlyTrends} /> },
        { label: 'Win Rate', value: `${data.winRate}%`, change: formatChange(data.winRateChange), positive: data.winRateChange >= 0, chart: <WinRateBarChart segments={data.bySegment} /> },
        { label: 'Avg Deal Size', value: formatCurrency(data.averageDealSize), change: formatChange(data.avgDealChange), positive: data.avgDealChange >= 0, chart: <AvgDealAreaChart trends={data.monthlyTrends} /> },
        { label: 'Sales Cycle', value: `${data.salesCycleTime} Days`, change: formatChange(data.cycleTimeChange, true), positive: data.cycleTimeChange <= 0, chart: <CycleTimeLineChart trends={data.monthlyTrends} /> },
    ];

    return (
        <Card ref={containerRef} sx={{ bgcolor: 'white', color: '#1a1f3c', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#1a1f3c' }}>
                    Revenue Drivers
                </Typography>
                {metrics.map((metric, index) => (
                    <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < 3 ? '1px solid #f1f5f9' : 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography sx={{ color: '#374151', fontWeight: 500, flex: 1 }}>
                                {metric.label}
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1a1f3c', flex: 1, textAlign: 'center' }}>
                                {metric.value}
                            </Typography>
                            <Typography fontWeight="600" sx={{ color: metric.positive ? '#22c55e' : '#ef4444', flex: 1, textAlign: 'right' }}>
                                {metric.change}
                            </Typography>
                        </Box>
                        {metric.chart}
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
}

export default RevenueDrivers;
