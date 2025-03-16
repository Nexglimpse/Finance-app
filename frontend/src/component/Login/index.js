import React from "react";
import { Card, Form, Input, Button, message } from "antd";
import Cookies from "js-cookie";
import { Navigate, useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const token = Cookies.get("jwt_token");
  if (token !== undefined) {
    return <Navigate to="/" />;
  }

  const onSubmitSuccess = (jwtTkoken) => {
    Cookies.set("jwt_token", jwtTkoken, {
      expires: 30,
      SameSite: "None",
      Secure: true,
    });

    navigate("/", { replace: true });
  };

  const submitForm = async (values) => {
    try {
      const response = await fetch("http://localhost:3100/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok === true) {
        onSubmitSuccess(data.jwtToken);
      } else {
        console.log(data.error_msg);
      }
    } catch (error) {
      // console.error("Login error:", error);
      message.error("Password or UserName Invalid");
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
      <Card title="Login" style={{ width: 400 }}>
        <Form
          name="login-form"
          initialValues={{ remember: true }}
          onFinish={submitForm}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Log in
            </Button>
          </Form.Item>
          <Form.Item>
            <Link to="/register">
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
                Register
              </Button>
            </Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
