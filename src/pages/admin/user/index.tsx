import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Page,
  List,
  Box,
  Button,
  Text,
} from "zmp-ui";
import { useRecoilState } from "recoil";
import AddStoreUserForm from "../../../components/store-user/add_store_user_form";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";

import { loadingState } from "../../../state";
import { deleteUserStore, getUserByStore } from "../../../api/api";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ConfirmModal from "../../../components/modal/confirmModal";

interface StoreUser {
  uuid: string;
  name: string;
  avatar: string;
}

interface StoreUserRole {
  role: string;
  user: StoreUser;
}

const UserPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid } = useParams<{ store_uuid?: string }>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  
  const [loading, setLoading] = useRecoilState(loadingState);
  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  const [storeUsers, setStoreUsers] = useState<StoreUserRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<StoreUser | null>(null);

  const handleUserAdded = () => {
    fetchUserListData();
  };

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    fetchUserListData();
  }, [store_uuid]);

  const fetchUserListData = async () => {
    if (!store_uuid) {
      return;
    }
    const data = await getUserByStore(store_uuid);
    if (!data?.error) {
      setStoreUsers(data.data || []);
      setLoading({ ...loading, isLoading: false });
    } else {
      console.error("Error:", data.error);
      setLoading({ ...loading, isLoading: false });
      setSnackbarMessage(String(data.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  const onDeleteUser = async () => {
    setIsShowConfirm(false);
    const data = await deleteUserStore({
      store_uuid: store_uuid,
      user_uuid: selectedUser?.uuid,
    });
    if (!data?.error) {
      fetchUserListData();
      setSnackbarMessage(t("snackbarMessage.deleteSuccess"));
        setSnackbarType("success");
        setSnackbarOpen(true);
    } else {
      console.error("Error:", data.error);
      setSnackbarMessage(String(data.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Page className="section-container">
      {store_uuid && (
        <AddStoreUserForm
          store_uuid={store_uuid}
          onUserAdded={handleUserAdded}
        />
      )}
      <ConfirmModal
        isShowModal={isShowConfirm}
        setIsShowModal={setIsShowConfirm}
        itemDelete={selectedUser?.name}
        onConfirm={() => onDeleteUser()}
      />
      <List>
        {storeUsers.map((store_user) => (
          <Box key={store_user.role} className="category-card-container">
            <img className="category-img" src={store_user.user.avatar}></img>
            <Box>
              <Box flex flexDirection="column">
                <Text size="xLarge" bold style={{ marginLeft: "10px" , color:'black'}}>
                  {store_user.user.name}
                </Text>

                <Text size="xLarge" bold style={{ marginLeft: "10px",color:'black' }}>
                  {store_user.role}
                </Text>
              </Box>
            </Box>
            <Button
              icon={<DeleteForeverOutlinedIcon />}
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(store_user.user);
                setIsShowConfirm(true);
              }}
            ></Button>
          </Box>
        ))}
      </List>
      <div style={{borderRadius:'10px'}}>
          {snackbarOpen && (
            <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
              <div className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}>
                <div style={{display:'flex'}}>
                  {snackbarType === "success" && <CheckCircleIcon style={{ marginRight: 8, color:'green' }} />} 
                  {snackbarType === "error" && <ErrorIcon style={{ marginRight: 8, color:'red' }} />} 
                  {snackbarMessage}
                </div>
              </div>
            </Snackbar>
          )}
        </div>
    </Page>
  );
};

export default UserPage;
