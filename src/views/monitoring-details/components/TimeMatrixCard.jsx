import React from 'react';
import { Card, CardContent } from '@/components/ui/card'; // shadcn/ui
import { PieChart, Pie, Cell } from 'recharts';

const TimeMatrixCard = () => {
  const data = [
    { name: 'Run (>50% load)', value: 6 },
    { name: 'Idle (<50%)', value: 2 }
  ];

  const COLORS = ['#4ade80', '#fbbf24']; // green for Run, yellow for Idle

  const totalHours = data.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardContent className="flex flex-col items-center pt-6">
        <h3 className="text-lg font-semibold mb-2">Time Matrix</h3>
        <PieChart width={200} height={200}>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-center text-sm fill-gray-700">
            Total {totalHours}hr
          </text>
        </PieChart>
        <div className="flex justify-around w-full mt-4 text-xs text-center">
          <div>
            <div className="font-medium text-green-600">Run</div>
            <div>{data[0].value} hr</div>
          </div>
          <div>
            <div className="font-medium text-yellow-600">Idle</div>
            <div>{data[1].value} hr</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeMatrixCard;
