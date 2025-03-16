import React, { useEffect, useState } from "react";
import { Button, message, Row, Col, Card, Popconfirm } from "antd";
import { List, Avatar, Typography } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { MdCurrencyRupee } from "react-icons/md";

import Cookies from "js-cookie";

import "./index.css";

const { Text } = Typography;

const ExpenseList = ({ handleEdit, triggerFetch }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [triggerFetch]);

  const fetchExpenses = async () => {
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
        const filteredExpenses = data.filter((item) => item.type === "expense");
        setExpenses(filteredExpenses);
      } else {
        message.error("Failed to fetch expenses");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setLoading(false);
      message.error("Failed to fetch expenses");
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
        message.success("Expense deleted successfully");
        fetchExpenses();
      } else {
        message.error("Failed to delete expense");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error deleting expense:", error);
      setLoading(false);
      message.error("Failed to delete expense");
    }
  };

  const onClickEdit = (expense) => {
    handleEdit(expense);
  };

  return (
    <div style={{ height: "410px", overflowY: "auto" }}>
      <List
        itemLayout="horizontal"
        dataSource={expenses}
        loading={loading}
        renderItem={(expense) => (
          <List.Item
            actions={[
              <Button type="text" onClick={() => onClickEdit(expense)}>
                <EditOutlined />
              </Button>,
              <Popconfirm
                title="Are you sure to delete this expense?"
                onConfirm={() => handleDelete(expense.cashflowId)}
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
                  icon={<ArrowDownOutlined />}
                  style={{ backgroundColor: "#ff4d4f" }}
                />
              }
              title={<Text strong>{expense.title}</Text>}
              description={
                <div>
                  <Text>
                    <MdCurrencyRupee />
                    {expense.amount}
                  </Text>
                  <br />
                  <Text>{expense.date}</Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

const ExpenseForm = ({ initialValues, reloadList }) => {
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
    const updatedValues = { title, amount, date, description, type: "expense" };
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
        message.error("Failed to update expense details");
      }
    } catch (error) {
      console.error("Error updating expense details:", error);
      setLoading(false);
      message.error("Failed to update expense details");
    }
  };

  return (
    <div style={{ height: "410px", overflowY: "auto" }}>
      <form onSubmit={onFinish} className="expense-form">
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

const Expense = () => {
  // Changed component name
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(false);

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
  };

  const reloadList = () => {
    setTriggerFetch(!triggerFetch);
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Add Expense" bordered={false}>
            <ExpenseForm
              initialValues={selectedExpense}
              reloadList={reloadList}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="All Expenses" bordered={false}>
            <ExpenseList handleEdit={handleEdit} triggerFetch={triggerFetch} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Expense;
