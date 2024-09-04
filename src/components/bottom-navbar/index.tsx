import React, { useEffect, useState } from "react";
import { BottomNavigation } from "zmp-ui";
import { storeState, tableState } from "../../state";
import { useRecoilValue } from "recoil";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PersonIcon from "@mui/icons-material/Person";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {useNavigate } from "zmp-ui"; // Thay đổi đây

interface BottomNavBarProps {
}

const BottomNavBar: React.FC<BottomNavBarProps> = () => {
  const { t } = useTranslation("global");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("menu");
  const store = useRecoilValue(storeState);
  const table = useRecoilValue(tableState);

  useEffect(() => {
    if (!pathname) return;

    if (pathname.includes("/menu")) {
      setActiveTab("menu");
      return;
    }
    if (pathname.includes("/order")) {
      setActiveTab("order");
      return;
    }
    if (pathname.includes("/profile")) {
      setActiveTab("me");
      return;
    }
  }, [pathname]);

  return (
    <BottomNavigation
      fixed
      activeKey={activeTab}
      onChange={(key: string) => setActiveTab(key)}
    >
      <BottomNavigation.Item
        label={t("navbar.menu")}
        key="menu"
        icon={<RestaurantMenuOutlinedIcon />}
        activeIcon={<RestaurantMenuOutlinedIcon />}
        //linkTo={`/menu/${store.uuid}/${table.uuid}?tenant_id=${store.subdomain}`}
        onClick={() =>
          navigate({
            pathname: `/menu/${store.uuid}/${table.uuid}`,
            search: `?tenant_id=${store.subdomain}`,
          })
        }
      />
      {/* <BottomNavigation.Item
        label={t("navbar.promotion.promotion")}
        key="promotion"
        icon={<ConfirmationNumberOutlinedIcon />}
        activeIcon={<ConfirmationNumberIcon />}
        linkTo="/user/promotion"
      /> */}
      <BottomNavigation.Item
        key="order"
        label={t("navbar.order")}
        icon={<AssignmentOutlinedIcon />}
        activeIcon={<AssignmentIcon />}
        linkTo={`/user/order/${store.uuid}`}
      />
      <BottomNavigation.Item
        key="me"
        label={t("navbar.user")}
        icon={<PersonOutlinedIcon />}
        activeIcon={<PersonIcon />}
        linkTo="/user/profile"
      />
    </BottomNavigation>
  );
};

export default BottomNavBar;
