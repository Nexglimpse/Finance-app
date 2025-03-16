import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Typography,
  Space,
  Popconfirm,
  Spin,
  Empty,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import Cookies from "js-cookie";
import "./index.css";

const { Title, Text } = Typography;

const BillReminderCard = ({
  reminderDetails,
  daysRemaining,
  onDelete,
  onEdit,
}) => {
  const { billId, title, amount, dueDate, description } = reminderDetails;

  return (
    <Card
      title={title}
      extra={
        <Text>
          {daysRemaining <= 5 ? (
            <Text type="danger">{`${daysRemaining} days remaining`}</Text>
          ) : (
            `${daysRemaining} days remaining`
          )}
        </Text>
      }
      className="bill-card"
      actions={[
        <Space key="actions">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(reminderDetails)}
          />
          <Popconfirm
            title="Are you sure you want to delete this reminder?"
            onConfirm={() => onDelete(billId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>,
      ]}
    >
      <p>
        <strong>Amount:</strong> ₹ {amount}
      </p>
      <p>
        <strong>Due Date:</strong> {moment(dueDate).format("MMMM Do YYYY")}
      </p>
      <p>
        <strong>Description:</strong> {description}
      </p>
    </Card>
  );
};

const BillReminderList = ({ billReminders, onDelete, onEdit }) => {
  if (billReminders.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Empty description={<span>No Data</span>} />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {billReminders.map((reminder) => (
        <Col key={reminder.id} span={8}>
          <BillReminderCard
            reminderDetails={reminder}
            // daysRemaining={moment(reminder.dueDate).diff(moment(), "days")}
            daysRemaining={moment(reminder.dueDate)
              .endOf("day")
              .diff(moment().endOf("day"), "days")}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </Col>
      ))}
    </Row>
  );
};

const BillReminder = () => {
  const [billReminders, setBillReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    billId: null,
    title: "",
    amount: "",
    dueDate: "",
    description: "",
  });
  const [loading, setLoading] = useState(true); // Initialize loading state as true

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const jwtToken = Cookies.get("jwt_token");
      const response = await fetch("http://localhost:3100/billreminder", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bill reminders");
      }

      const data = await response.json();
      setBillReminders(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Set loading state to false after fetching data
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jwtToken = Cookies.get("jwt_token");
    const methodType = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `http://localhost:3100/billreminder/${formData.billId}`
      : "http://localhost:3100/billreminder";

    const options = {
      method: methodType,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(formData),
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error("Failed to add bill reminder");
      }

      // Reload bill list after adding new reminder
      fetchData();

      if (isEdit) {
        setIsEdit(!isEdit);
      }

      setFormData({
        billId: null,
        title: "",
        amount: "",
        dueDate: "",
        description: "",
      });
      toggleForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id) => {
    const jwtToken = Cookies.get("jwt_token");
    const options = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    };

    try {
      const response = await fetch(
        `http://localhost:3100/billreminder/${id}`,
        options
      );

      if (!response.ok) {
        throw new Error("Failed to delete bill reminder");
      }

      fetchData();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = async (reminderData) => {
    setIsEdit(!isEdit);

    setFormData({
      billId: reminderData.billId,
      title: reminderData.title,
      amount: reminderData.amount,
      dueDate: reminderData.dueDate,
      description: reminderData.description,
    });

    toggleForm();
  };

  const renderButton = showForm ? (
    <Button
      type="primary"
      className="add-reminder-btn"
      onClick={toggleForm}
      danger
    >
      Cancel
    </Button>
  ) : (
    <Button type="primary" className="add-reminder-btn" onClick={toggleForm}>
      Add New Bill Reminder
    </Button>
  );

  return (
    <div className="bill-container">
      {renderButton}

      <Title level={2} className="bill-title">
        Bill Reminders
      </Title>

      {showForm && (
        <Card title="Edit Bill Reminder" className="form-card">
          <form onSubmit={handleSubmit} className="bill-form">
            <label className="form-label">
              Title:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </label>
            <label className="form-label">
              Amount:
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="form-input"
                required
              />
            </label>
            <label className="form-label">
              Due Date:
              <input
                type="date"
                name="dueDate"
                value={moment(formData.dueDate).format("YYYY-MM-DD")}
                onChange={handleChange}
                className="form-input"
                required
              />
            </label>
            <label className="form-label">
              Description:
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
              />
            </label>
            <Button type="primary" htmlType="submit" className="submit-btn">
              Save
            </Button>
          </form>
        </Card>
      )}

      {loading ? ( // Render Spin component while loading
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <BillReminderList
          billReminders={billReminders}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default BillReminder;
