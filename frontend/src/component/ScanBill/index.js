import React, { useState } from "react";
import { Card, Upload, Button, Typography, Divider, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import scanImg from "../../img/scan_img.jpg";

import Cookies from "js-cookie";

const { Text } = Typography;

const ScanBill = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const formData = new FormData();

    fileList.forEach((file) => {
      formData.append("files[]", file);
    });

    setUploading(true);

    let jwtToken = Cookies.get("jwt_token");

    try {
      const response = await fetch("http://localhost:3100/scanbill", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        body: formData,
      });

      console.log(response);
      if (response.ok) {
        setFileList([]);
        message.success("Upload successful");
      } else {
        throw new Error("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      message.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Card
        title="Upload Bill Image"
        style={{ width: 400, textAlign: "center" }}
      >
        <div style={{ marginBottom: 16 }}>
          <img
            src={scanImg}
            alt="scan bill"
            style={{ width: 200, height: 200, objectFit: "cover" }}
          />
        </div>
        <Text style={{ marginBottom: 16 }}>
          Upload an image of your bill to automatically extract and record
          expenses.
        </Text>

        <Divider />

        <Upload {...props}>
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>

        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{
            marginTop: 16,
          }}
        >
          {uploading ? "Scanning" : "Start Scan"}
        </Button>
      </Card>
    </div>
  );
};

export default ScanBill;
