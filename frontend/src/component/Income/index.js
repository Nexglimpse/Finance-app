import React, { useEffect, useState } from "react";
import { Button, message, Row, Col, Card, Popconfirm } from "antd";
import { List, Avatar, Typography } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { MdCurrencyRupee } from "react-icons/md";

import Cookies from "js-cookie";

import "./index.css";

const { Text } = Typography;

const IncomeList = ({ handleEdit, triggerFetch }) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncomes();
  }, [triggerFetch]);

  const fetchIncomes = async () => {
    let jwtToken = Cookies.get("jwt_token");
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3100/cashflow", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const filteredIncomes = data.filter((item) => item.type === "income");

        setIncomes(filteredIncomes);
      } else {
        message.error("Failed to fetch incomes");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching incomes:", error);
      setLoading(false);
      message.error("Failed to fetch incomes");
    }
  };

  const handleDelete = async (cashflowId) => {
    let jwtToken = Cookies.get("jwt_token");
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3100/cashflow/${cashflowId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      if (response.ok) {
        message.success("Income deleted successfully");
        fetchIncomes(); // Reload incomes after deletion
      } else {
        message.error("Failed to delete income");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error deleting income:", error);
      setLoading(false);
      message.error("Failed to delete income");
    }
  };

  const onClickEdit = (income) => {
    handleEdit(income);
  };

  return (
    <div style={{ height: "410px", overflowY: "auto" }}>
      <List
        itemLayout="horizontal"
        dataSource={incomes}
        loading={loading}
        renderItem={(income) => (
          <List.Item
            actions={[
              <Button type="text" onClick={() => onClickEdit(income)}>
                <EditOutlined />
              </Button>,
              <Popconfirm
                title="Are you sure to delete this income?"
                onConfirm={() => handleDelete(income.cashflowId)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" danger>
                  <DeleteOutlined />
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<ArrowUpOutlined />}
                  style={{ backgroundColor: "#52c41a" }}
                />
              }
              title={<Text strong>{income.title}</Text>}
              description={
                <div>
                  <Text>
                    <MdCurrencyRupee />
                    {income.amount}
                  </Text>
                  <br />
                  <Text>{income.date}</Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

const IncomeForm = ({ initialValues, reloadList }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialValues ? initialValues.title : "");
  const [amount, setAmount] = useState(
    initialValues ? initialValues.amount : ""
  );
  const [date, setDate] = useState(initialValues ? initialValues.date : "");
  const [description, setDescription] = useState(
    initialValues ? initialValues.description : ""
  );

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title);
      setAmount(initialValues.amount);
      setDate(initialValues.date);
      setDescription(initialValues.description);
    }
  }, [initialValues]);

  const onFinish = async (e) => {
    e.preventDefault();
    const updatedValues = { title, amount, date, description, type: "income" };
    let jwtToken = Cookies.get("jwt_token");

    try {
      let url = "http://localhost:3100/cashflow";
      let options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedValues),
      };

      if (initialValues !== null) {
        url = `http://localhost:3100/cashflow/${initialValues.cashflowId}`;
        options = {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedValues),
        };
      }

      setLoading(true);
      const response = await fetch(url, options);

      setLoading(false);
      if (response.ok) {
        message.success("Submitted successfully");
        setTitle("");
        setAmount("");
        setDate("");
        setDescription("");
        reloadList();
      } else {
        message.error("Failed to update income details");
      }
    } catch (error) {
      console.error("Error updating income details:", error);
      setLoading(false);
      message.error("Failed to update income details");
    }
  };

  return (
    <div style={{ height: "410px", overflowY: "auto" }}>
      <form onSubmit={onFinish} className="income-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="date" className="form-label">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
          />
        </div>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="submit-btn"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

const Income = () => {
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(false); // State to trigger list reload

  const handleEdit = (income) => {
    setSelectedIncome(income);
  };

  const reloadList = () => {
    setTriggerFetch(!triggerFetch); // Toggle the state to trigger list reload
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Add Income" bordered={false}>
            <IncomeForm
              initialValues={selectedIncome}
              reloadList={reloadList}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="All Income" bordered={false}>
            <IncomeList handleEdit={handleEdit} triggerFetch={triggerFetch} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Income;
