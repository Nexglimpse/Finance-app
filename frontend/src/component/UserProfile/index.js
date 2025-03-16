import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Row, Col, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  LockFilled,
} from "@ant-design/icons";

import Cookies from "js-cookie";

const UserProfile = () => {
  const [user, setUser] = useState("");
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    // Fetch user details when component mounts
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    const url = "http://localhost:3100/userdetail";
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
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleChangePassword = async () => {
    const url = "http://localhost:3100/userdetail/changepassword";
    const jwtToken = Cookies.get("jwt_token");
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      }),
    };

    try {
      const response = await fetch(url, options);

      if (response.ok) {
        const data = await response.text();
        message.success(data);
        setPasswords({ oldPassword: "", newPassword: "" });
      } else {
        const errorData = await response.text();
        message.error(errorData);
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  return (
    <Row gutter={24}>
      {/* Left Container - User Details */}
      <Col span={12}>
        <Card title="User Details">
          <Form layout="vertical">
            <Form.Item label="Name">
              <Input prefix={<UserOutlined />} value={user.name} readOnly />
            </Form.Item>
            <Form.Item label="Email">
              <Input prefix={<MailOutlined />} value={user.email} readOnly />
            </Form.Item>
            <Form.Item label="Phone Number">
              <Input
                prefix={<PhoneOutlined />}
                value={user.phoneNumber}
                readOnly
              />
            </Form.Item>
            <Form.Item label="Gender">
              <Input
                prefix={<LockFilled />}
                value={user.gender === "male" ? "Male" : "Female"}
                readOnly
              />
            </Form.Item>
          </Form>
        </Card>
      </Col>

      {/* Right Container - Change Password */}
      <Col span={12}>
        <Card title="Change Password">
          <Form layout="vertical">
            <Form.Item label="Old Password">
              <Input.Password
                prefix={<LockOutlined />}
                value={passwords.oldPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, oldPassword: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item label="New Password">
              <Input.Password
                prefix={<LockOutlined />}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleChangePassword} danger>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default UserProfile;
