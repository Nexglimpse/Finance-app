import "./index.css";

import { Component } from "react";

import { Card, Row, Col } from "antd";
import {
  DollarCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import IncomeExpenseChart from "../IncomeExpenseChart";

import { List, Avatar, Typography } from "antd";
import Cookies from "js-cookie";

import { ColorRing } from "react-loader-spinner";

const { Text } = Typography;

// const dummyTransactions = [
//   {
//     title: "Salary",
//     amount: "$2000",
//     date: "2024-03-25",
//     type: "income",
//   },
//   { title: "Rent", amount: "$1000", date: "2024-03-24", type: "expense" },
//   { title: "Groceries", amount: "$150", date: "2024-03-23", type: "expense" },
//   {
//     title: "Freelance Work",
//     amount: "$500",
//     date: "2024-03-22",
//     type: "income",
//   },
//   {
//     title: "Internet Bill",
//     amount: "$50",
//     date: "2024-03-21",
//     type: "expense",
//   },
//   // Add more transactions as needed
// ];

// Components

const RecentTransactionsList = ({ transactions }) => {
  const renderIcon = (type) => {
    if (type === "income") {
      return (
        <Avatar
          icon={<ArrowUpOutlined />}
          style={{ backgroundColor: "#52c41a" }}
        />
      );
    } else if (type === "expense") {
      return (
        <Avatar
          icon={<ArrowDownOutlined />}
          style={{ backgroundColor: "#f5222d" }}
        />
      );
    }
  };

  return (
    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
      <List
        itemLayout="horizontal"
        dataSource={transactions}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={renderIcon(item.type)}
              title={<Text strong>{item.title}</Text>}
              description={
                <div>
                  <Text>{item.amount}</Text>
                  <br />
                  <Text type="secondary">{item.date}</Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

const CardList = (props) => {
  const { balanceDetails } = props;
  const { balance, totalIncome, totalExpense } = balanceDetails;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
        <Card
          title={
            <span>
              <DollarCircleOutlined style={{ color: "blue" }} /> Balance
            </span>
          }
          bordered={false}
        >
          <p className="card-list-amount">
            {balance != null ? (
              `₹ ${balance}`
            ) : (
              <ColorRing
                visible={true}
                height="30"
                width="30"
                ariaLabel="color-ring-loading"
                wrapperStyle={{}}
                wrapperClass="color-ring-wrapper"
                colors={["#0437F2", "#0437F2", "#0437F2", "#0437F2", "#0437F2"]}
              />
            )}
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card
          title={
            <span>
              <ArrowUpOutlined style={{ color: "blue" }} /> Income
            </span>
          }
          bordered={false}
        >
          <p className="card-list-amount">
            {totalIncome != null ? (
              `₹ ${totalIncome}`
            ) : (
              <ColorRing
                visible={true}
                height="30"
                width="30"
                ariaLabel="color-ring-loading"
                wrapperStyle={{}}
                wrapperClass="color-ring-wrapper"
                colors={["#0437F2", "#0437F2", "#0437F2", "#0437F2", "#0437F2"]}
              />
            )}
          </p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card
          title={
            <span>
              <ArrowDownOutlined style={{ color: "blue" }} /> Expense
            </span>
          }
          bordered={false}
        >
          <p className="card-list-amount">
            {totalExpense != null ? (
              `₹ ${totalExpense}`
            ) : (
              <ColorRing
                visible={true}
                height="30"
                width="30"
                ariaLabel="color-ring-loading"
                wrapperStyle={{}}
                wrapperClass="color-ring-wrapper"
                colors={["#0437F2", "#0437F2", "#0437F2", "#0437F2", "#0437F2"]}
              />
            )}
          </p>
        </Card>
      </Col>
    </Row>
  );
};

class Dashboard extends Component {
  state = { balanceDetails: "", recentTransactions: [] };

  getBalanceDetails = async () => {
    const url = "http://localhost:3100/balance";
    const jwtToken = Cookies.get("jwt_token");

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    };

    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        this.setState({ balanceDetails: data });
      } else {
        console.error("Failed to fetch balance details");
      }
    } catch (error) {
      console.error("Error fetching balance details:", error);
    }
  };

  getRecentTransactions = async () => {
    const url = "http://localhost:3100/cashflow";
    const jwtToken = Cookies.get("jwt_token");

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    };

    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        const recentTransactionsData = data.slice(0, 6);
        this.setState({ recentTransactions: recentTransactionsData });
      } else {
        console.error("Failed to fetch recent transactions");
      }
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    }
  };

  componentDidMount() {
    this.getBalanceDetails();
    this.getRecentTransactions();
  }

  render() {
    const { balanceDetails, recentTransactions } = this.state;

    return (
      <div>
        <Row className="section-1" style={{ marginBottom: "20px" }}>
          <Col span={24}>
            <CardList balanceDetails={balanceDetails} />
          </Col>
        </Row>
        <Row className="section-2">
          <Col span={14} style={{ paddingRight: "16px" }}>
            <div className="chart-container">
              <Card title="Income & Expense Chart">
                <IncomeExpenseChart />
              </Card>
            </div>
          </Col>
          <Col span={10}>
            <div className="recent-history">
              <Card title="Recent Transactions">
                <RecentTransactionsList transactions={recentTransactions} />
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Dashboard;
