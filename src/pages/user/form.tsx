import React, { useState } from "react";
import { Button, Input, Box, Page, useSnackbar } from "zmp-ui";
import { useRecoilState } from "recoil";
import { userState } from "../../state";
import { useTranslation } from "react-i18next";

interface Form {
  name: string;
  avatar: string;
}

const FormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const [user, setUser] = useRecoilState(userState);
  const [form, setForm] = React.useState({ ...user });
  const [showSnackbar, setShowSnackbar] =useState(false);

  const handleChangeInput = (field: keyof Form, value:string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = () => {
    setUser(form);
    setShowSnackbar(true);
  };
  return (
    <Page>
      <div className="section-container">
        <Box>
          <Input
            id="name"
            label="Name"
            type="text"
            placeholder="Zalo"
            value={form?.name}
            onChange={(e) => handleChangeInput("name", e.target.value)}
          />
          <Input
            label="Avatar"
            type="text"
            placeholder="zalo@zalo.me"
            value={form?.avatar}
            onChange={(e) => handleChangeInput("avatar", e.target.value)}
          />
          <Box mt={4}>
            <Button fullWidth variant="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </div>
    </Page>
  );
};

export default FormPage;
