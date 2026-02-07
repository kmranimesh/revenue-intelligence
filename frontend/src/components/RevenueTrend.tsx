import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import * as d3 from 'd3';

interface TrendData {
    month: string;
    revenue: number;
    target: number;
}

function RevenueTrend() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [chartWidth, setChartWidth] = useState(500);

    useEffect(() => {
        Promise.all([
            fetch('/api/drivers').then(res => res.json()),
            fetch('/api/summary').then(res => res.json())
        ]).then(([driversData, summaryData]) => {
            if (driversData.monthlyTrends && driversData.monthlyTrends.length > 0) {
                const monthlyTarget = summaryData.target / 3;
                const trend: TrendData[] = driversData.monthlyTrends.slice(-6).map((m: { month: string; revenue: number }) => ({
                    month: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
                    revenue: m.revenue,
                    target: Math.round(monthlyTarget)
                }));
                setTrendData(trend);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setChartWidth(containerRef.current.offsetWidth - 48);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [loading]);

    useEffect(() => {
        if (trendData.length > 0 && svgRef.current) {
            drawChart();
        }
    }, [trendData, chartWidth]);

    const drawChart = () => {
        if (!svgRef.current || trendData.length === 0 || chartWidth < 100) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const height = 220;
        const margin = { top: 25, right: 20, bottom: 40, left: 45 };

        const x = d3.scaleBand()
            .domain(trendData.map(d => d.month))
            .range([margin.left, chartWidth - margin.right])
            .padding(0.35);

        const maxVal = Math.max(...trendData.map(d => Math.max(d.revenue, d.target)));
        const y = d3.scaleLinear()
            .domain([0, maxVal * 1.15])
            .range([height - margin.bottom, margin.top]);

        const g = svg.append('g');

        // Y-axis grid lines (horizontal dashed lines like reference)
        const yTicks = y.ticks(5);
        g.selectAll('.grid-line')
            .data(yTicks)
            .join('line')
            .attr('x1', margin.left)
            .attr('x2', chartWidth - margin.right)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('stroke', '#e5e7eb')
            .attr('stroke-width', 1);

        // Draw bars (revenue) - blue like reference
        g.selectAll('.bar')
            .data(trendData)
            .join('rect')
            .attr('x', d => x(d.month)!)
            .attr('y', d => y(d.revenue))
            .attr('width', x.bandwidth())
            .attr('height', d => height - margin.bottom - y(d.revenue))
            .attr('fill', '#4169aa')
            .attr('rx', 3);

        // Draw line (target) - orange like reference
        const line = d3.line<TrendData>()
            .x(d => x(d.month)! + x.bandwidth() / 2)
            .y(d => y(d.target))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(trendData)
            .attr('fill', 'none')
            .attr('stroke', '#f59e0b')
            .attr('stroke-width', 2.5)
            .attr('d', line);

        // Draw dots on line - hollow circles like reference
        g.selectAll('.dot')
            .data(trendData)
            .join('circle')
            .attr('cx', d => x(d.month)! + x.bandwidth() / 2)
            .attr('cy', d => y(d.target))
            .attr('r', 6)
            .attr('fill', 'white')
            .attr('stroke', '#f59e0b')
            .attr('stroke-width', 2.5);

        // X axis - just text, no line
        g.selectAll('.x-label')
            .data(trendData)
            .join('text')
            .attr('x', d => x(d.month)! + x.bandwidth() / 2)
            .attr('y', height - margin.bottom + 25)
            .attr('text-anchor', 'middle')
            .attr('fill', '#374151')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text(d => d.month);

        // Y axis labels
        const formatK = (d: number) => d >= 1000 ? `${Math.round(d / 1000)}K` : `${d}`;
        g.selectAll('.y-label')
            .data(yTicks)
            .join('text')
            .attr('x', margin.left - 10)
            .attr('y', d => y(d) + 4)
            .attr('text-anchor', 'end')
            .attr('fill', '#6b7280')
            .attr('font-size', '12px')
            .text(d => formatK(d));
    };

    if (loading) {
        return (
            <Card sx={{ bgcolor: 'white' }}>
                <CardContent><Skeleton variant="rectangular" height={220} /></CardContent>
            </Card>
        );
    }

    return (
        <Card ref={containerRef} sx={{ bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    <Box component="span" fontWeight="bold" color="#1a1f3c">Revenue Trend</Box>
                    <Box component="span" color="#6b7280" fontWeight="normal" ml={1}>(Last 6 Months)</Box>
                </Typography>
                <svg ref={svgRef} width={chartWidth} height={220} style={{ display: 'block' }} />
            </CardContent>
        </Card>
    );
}

export default RevenueTrend;
