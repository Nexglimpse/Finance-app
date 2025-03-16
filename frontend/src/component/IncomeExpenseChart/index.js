import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import Cookies from "js-cookie";

const IncomeExpenseChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const jwtToken = Cookies.get("jwt_token");

      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };

      try {
        const incomeResponse = await fetch(
          "http://localhost:3100/cashflowincome",
          options
        );
        const expenseResponse = await fetch(
          "http://localhost:3100/cashflowexpense",
          options
        );

        if (!incomeResponse.ok || !expenseResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();

        const formattedData = formatData(incomeData, expenseData);
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatData = (incomeData, expenseData) => {
    const formattedData = [];

    // Assuming the incomeData and expenseData have the same length
    for (let i = 0; i < incomeData.length; i++) {
      formattedData.push({
        name: incomeData[i].month, // Assuming the month is included in the income and expense data
        income: incomeData[i].totalIncome,
        expense: expenseData[i].totalExpense,
      });
    }

    return formattedData;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f5222d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f5222d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#52c41a"
          fillOpacity={1}
          fill="url(#colorIncome)"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#f5222d"
          fillOpacity={1}
          fill="url(#colorExpense)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseChart;
