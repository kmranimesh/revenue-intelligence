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
        // Fetch monthly revenue data from drivers endpoint
        Promise.all([
            fetch('/api/drivers').then(res => res.json()),
            fetch('/api/summary').then(res => res.json())
        ]).then(([driversData, summaryData]) => {
            if (driversData.monthlyTrends && driversData.monthlyTrends.length > 0) {
                const monthlyTarget = summaryData.target / 3; // Quarterly target divided by 3
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
                setChartWidth(containerRef.current.offsetWidth - 60);
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
        if (!svgRef.current || trendData.length === 0) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const height = 200;
        const margin = { top: 20, right: 30, bottom: 35, left: 50 };

        const x = d3.scaleBand()
            .domain(trendData.map(d => d.month))
            .range([margin.left, chartWidth - margin.right])
            .padding(0.4);

        const maxVal = Math.max(...trendData.map(d => Math.max(d.revenue, d.target)));
        const y = d3.scaleLinear()
            .domain([0, maxVal * 1.2])
            .range([height - margin.bottom, margin.top]);

        const g = svg.append('g');

        // Grid lines
        g.selectAll('.grid-line')
            .data(y.ticks(5))
            .join('line')
            .attr('class', 'grid-line')
            .attr('x1', margin.left)
            .attr('x2', chartWidth - margin.right)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('stroke', '#e5e7eb')
            .attr('stroke-dasharray', '2,2');

        // Draw bars (revenue)
        g.selectAll('.bar')
            .data(trendData)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.month)!)
            .attr('y', d => y(d.revenue))
            .attr('width', x.bandwidth())
            .attr('height', d => height - margin.bottom - y(d.revenue))
            .attr('fill', '#3b82f6')
            .attr('rx', 4);

        // Draw line (target)
        const line = d3.line<TrendData>()
            .x(d => x(d.month)! + x.bandwidth() / 2)
            .y(d => y(d.target))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(trendData)
            .attr('fill', 'none')
            .attr('stroke', '#f97316')
            .attr('stroke-width', 2.5)
            .attr('d', line);

        // Draw dots on line
        g.selectAll('.dot')
            .data(trendData)
            .join('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.month)! + x.bandwidth() / 2)
            .attr('cy', d => y(d.target))
            .attr('r', 5)
            .attr('fill', 'white')
            .attr('stroke', '#f97316')
            .attr('stroke-width', 2);

        // X axis
        g.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll('text')
            .style('fill', '#64748b')
            .style('font-size', '12px');

        // Y axis
        const formatK = (d: number) => d >= 1000000 ? `$${(d / 1000000).toFixed(1)}M` : d >= 1000 ? `$${(d / 1000).toFixed(0)}K` : `$${d}`;
        g.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => formatK(d as number)).tickSize(0))
            .selectAll('text')
            .style('fill', '#64748b')
            .style('font-size', '11px');

        // Remove axis lines
        svg.selectAll('.domain').style('stroke', 'none');
    };

    if (loading) {
        return (
            <Card sx={{ bgcolor: 'white', color: '#1a1f3c' }}>
                <CardContent>
                    <Skeleton variant="text" width={200} />
                    <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card ref={containerRef} sx={{ bgcolor: 'white', color: '#1a1f3c', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Revenue Trend
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 14, height: 14, bgcolor: '#3b82f6', borderRadius: 1 }} />
                            <Typography variant="caption" color="text.secondary">Revenue</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 14, height: 3, bgcolor: '#f97316', borderRadius: 1 }} />
                            <Typography variant="caption" color="text.secondary">Target</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <svg ref={svgRef} width={chartWidth} height={200} />
                </Box>
            </CardContent>
        </Card>
    );
}

export default RevenueTrend;
