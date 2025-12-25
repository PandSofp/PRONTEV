import React from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Dados mockados - serão substituídos por dados reais do Supabase
const salesData = [
    { name: 'Seg', vendas: 4000, servicos: 2400 },
    { name: 'Ter', vendas: 3000, servicos: 1398 },
    { name: 'Qua', vendas: 2000, servicos: 9800 },
    { name: 'Qui', vendas: 2780, servicos: 3908 },
    { name: 'Sex', vendas: 1890, servicos: 4800 },
    { name: 'S\u00e1b', vendas: 2390, servicos: 3800 },
    { name: 'Dom', vendas: 3490, servicos: 4300 },
]

const topProductsData = [
    { name: 'Coca-Cola', vendas: 156 },
    { name: 'Caderno A4', vendas: 98 },
    { name: 'USB 16GB', vendas: 87 },
    { name: 'Arroz 1kg', vendas: 75 },
    { name: 'Impress\u00e3o', vendas: 65 },
]

const categoryData = [
    { name: 'Alimenta\u00e7\u00e3o', value: 400 },
    { name: 'Material Escolar', value: 300 },
    { name: 'Eletr\u00f4nicos', value: 200 },
    { name: 'Servi\u00e7os', value: 100 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export const SalesTrendChart = ({ data = salesData }) => (
    <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
            <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorServicos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
                contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            />
            <Legend />
            <Area type="monotone" dataKey="vendas" stroke="#0088FE" fillOpacity={1} fill="url(#colorVendas)" />
            <Area type="monotone" dataKey="servicos" stroke="#00C49F" fillOpacity={1} fill="url(#colorServicos)" />
        </AreaChart>
    </ResponsiveContainer>
)

export const TopProductsChart = ({ data = topProductsData }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
                contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            />
            <Bar dataKey="vendas" fill="#0088FE" radius={[8, 8, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
)

export const CategoryDistributionChart = ({ data = categoryData }) => (
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
)

export const RevenueChart = ({ data = salesData }) => (
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
                contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            />
            <Legend />
            <Line type="monotone" dataKey="vendas" stroke="#0088FE" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="servicos" stroke="#00C49F" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
    </ResponsiveContainer>
)
