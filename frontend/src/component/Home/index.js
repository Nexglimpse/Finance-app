import React, { useState } from "react";
import { Layout, Menu, Button, theme } from "antd";

import { BiSolidBellRing } from "react-icons/bi";
import { MdDashboard } from "react-icons/md";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { AiOutlineScan } from "react-icons/ai";
import { BiSolidReport } from "react-icons/bi";
import { GoSignOut } from "react-icons/go";
import { UserOutlined } from "@ant-design/icons";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";

import { Navigate, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import "./index.css";

import Dashboard from "../Dashboard";
import BillReminder from "../BillReminder";
import Income from "../Income";
import ScanBill from "../ScanBill";
import UserProfile from "../UserProfile";
import Expense from "../Expense";
import Report from "../Report";

// CODE STARTS

const { Header, Sider, Content } = Layout;

const Home = () => {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [activeTabId, setActiveTabId] = useState(1);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const token = Cookies.get("jwt_token");
  if (token === undefined) {
    return <Navigate to="/login" />;
  }

  let dashboardContent;

  switch (activeTabId) {
    case 1:
      dashboardContent = <Dashboard />;
      break;
    case 2:
      dashboardContent = <BillReminder />;
      break;
    case 3:
      dashboardContent = <Income />;
      break;
    case 4:
      dashboardContent = <Expense />;
      break;
    case 5:
      dashboardContent = <ScanBill />;
      break;
    case 6:
      dashboardContent = <Report />;
      break;
    case 7:
      dashboardContent = <UserProfile />;
      break;
    default:
      dashboardContent = <h1>Signed Out</h1>;
  }

  const onClickLogout = () => {
    Cookies.remove("jwt_token", {
      expires: 30,
      SameSite: "None",
      Secure: true,
    });

    navigate("/", { replace: true });
  };

  return (
    <Layout
      style={{
        height: "100vh",
      }}
    >
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item
            key="1"
            icon={<MdDashboard style={{ fontSize: "20px" }} />}
            onClick={() => setActiveTabId(1)}
          >
            Dashboard
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<BiSolidBellRing style={{ fontSize: "20px" }} />}
            onClick={() => setActiveTabId(2)}
          >
            Bill Reminder
          </Menu.Item>
          <Menu.Item
            key="3"
            icon={<FaMoneyBillTrendUp style={{ fontSize: "20px" }} />}
            onClick={() => setActiveTabId(3)}
          >
            Income
          </Menu.Item>
          <Menu.Item
            key="4"
            icon={<FaMoneyBillTransfer style={{ fontSize: "20px" }} />}
            onClick={() => setActiveTabId(4)}
          >
            Expense
          </Menu.Item>

          <Menu.Item
            key="5"
            icon={<AiOutlineScan style={{ fontSize: "20px" }} />}
            onClick={() => setActiveTabId(5)}
          >
            Scan Bill
          </Menu.Item>

          <Menu.Item
            key="6"
            icon={<BiSolidReport style={{ fontSize: "20px" }} />}
            onClick={() => setActiveTabId(6)}
          >
            Reports
          </Menu.Item>

          <Menu.Divider style={{ borderColor: "#808080" }} />

          <Menu.Item
            key="7"
            icon={<UserOutlined style={{ fontSize: "20px" }} />}
            onClick={() => setActiveTabId(7)}
          >
            View Profile
          </Menu.Item>
          <Menu.Item
            key="8"
            icon={<GoSignOut style={{ fontSize: "20px" }} />}
            onClick={onClickLogout}
          >
            Sign Out
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout
        style={{
          backgroundColor: "#f0f2f5",
        }}
      >
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <AiOutlineMenuUnfold /> : <AiOutlineMenuFold />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            overflow: "scroll",
          }}
        >
          {dashboardContent}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
