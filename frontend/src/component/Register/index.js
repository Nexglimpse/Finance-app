import React, { useState } from "react";
import { Form, Input, Button, Select, Card } from "antd";
import Cookies from "js-cookie";
import { Navigate, useNavigate, Link } from "react-router-dom";

const { Option } = Select;

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const token = Cookies.get("jwt_token");
  if (token !== undefined) {
    return <Navigate to="/" />;
  }

  const onFinish = async (values) => {
    setLoading(true);
    const jwtToken = Cookies.get("jwt_token");

    try {
      const response = await fetch("http://localhost:3100/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card title="Register" style={{ width: 400 }}>
        <Form
          name="register"
          onFinish={onFinish}
          initialValues={{
            gender: "male",
          }}
        >
          <Form.Item
            name="email"
            rules={[
              {
                type: "email",
                message: "Please enter a valid email!",
              },
              {
                required: true,
                message: "Please enter your email!",
              },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter your name!",
              },
            ]}
          >
            <Input placeholder="Name" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: "Please enter your phone number!",
              },
            ]}
          >
            <Input placeholder="Phone Number" />
          </Form.Item>

          <Form.Item
            name="gender"
            rules={[
              {
                required: true,
                message: "Please select your gender!",
              },
            ]}
          >
            <Select placeholder="Gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password!",
              },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              style={{
                width: "100%",
                marginTop: "12px",
              }}
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>
          <Form.Item>
            <Link to="/login">
              <Button
                type="default"
                style={{
                  width: "100%",
                  color: "blue",
                  borderColor: "blue",
                  background: "transparent",
                  outline: "blue",
                }}
              >
                Login
              </Button>
            </Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
