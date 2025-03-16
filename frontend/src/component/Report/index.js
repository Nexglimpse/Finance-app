import React, { useState, useEffect } from "react";
import { Card, Col, Row, Typography } from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Cookies from "js-cookie";

const { Title } = Typography;

const preprocessDataForBarChart = (incomeData, expenseData) => {
  const combinedData = [];

  // Merge income and expense data into a single array
  for (const incomeItem of incomeData) {
    const matchingExpenseItem = expenseData.find(
      (expenseItem) => expenseItem.month === incomeItem.month
    );

    combinedData.push({
      month: incomeItem.month,
      income: incomeItem.totalIncome,
      expense: matchingExpenseItem ? matchingExpenseItem.totalExpense : 0,
    });
  }

  return combinedData;
};

const MonthlyIncomeExpenseBarChart = ({ data }) => {
  return (
    <Card style={{ marginTop: "16px" }}>
      <Title level={4}>Monthly Income & Expense</Title>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#52c41a" name="Income" />
          <Bar dataKey="expense" fill="#f5222d" name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

const IncomeExpenseLineCharts = ({ incomeData, expenseData }) => {
  return (
    <Card>
      <Title level={4}>Income & Expense</Title>
      <Row gutter={16}>
        {/* Income Line Chart */}
        <Col span={12}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={incomeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalIncome"
                stroke="#52c41a"
                strokeWidth={2}
                name="Income"
              />
            </LineChart>
          </ResponsiveContainer>
        </Col>
        {/* Expense Line Chart */}
        <Col span={12}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={expenseData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalExpense"
                stroke="#f5222d"
                strokeWidth={2}
                name="Expense"
              />
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Card>
  );
};

const Report = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  useEffect(() => {
    const fetchIncomeData = async () => {
      const jwtToken = Cookies.get("jwt_token");

      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };

      try {
        const response = await fetch(
          "http://localhost:3100/cashflowincome",
          options
        );
        if (response.ok) {
          const data = await response.json();
          setIncomeData(data);
        } else {
          throw new Error("Failed to fetch income data");
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchExpenseData = async () => {
      const jwtToken = Cookies.get("jwt_token");

      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      };

      try {
        const response = await fetch(
          "http://localhost:3100/cashflowexpense",
          options
        );
        if (response.ok) {
          const data = await response.json();
          setExpenseData(data);
        } else {
          throw new Error("Failed to fetch expense data");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchIncomeData();
    fetchExpenseData();
  }, []);

  useEffect(() => {
    // Process income and expense data for bar chart
    const processedData = preprocessDataForBarChart(incomeData, expenseData);
    setBarChartData(processedData);
  }, [incomeData, expenseData]);

  return (
    <div>
      <IncomeExpenseLineCharts
        incomeData={incomeData}
        expenseData={expenseData}
      />
      <MonthlyIncomeExpenseBarChart data={barChartData} />
    </div>
  );
};

export default Report;
