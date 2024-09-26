import React, { useEffect, useState } from 'react';
import { Avatar, Box, Text } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { userState } from '../state';
import { useNavigate } from 'react-router-dom';
import { useInitData } from '@telegram-apps/sdk-react';

interface UserCardProps {
  isAdmin?: boolean;
  showOrderHistory?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ isAdmin = false, showOrderHistory = true }) => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const [userLoaded, setUserLoaded] = useState(false);
  const initData = useInitData();
  
  const avt = [(initData?.user?.firstName?.charAt(0)), (initData?.user?.lastName?.charAt(0))]
  console.log(avt.toString().split(",")); 
  console.log(avt.join("")); 
  const goToUserProfile = () => {
    if (isAdmin) {
      const params = new URLSearchParams();
      if (showOrderHistory) {
        params.append('showOrderHistory', 'true');
      }
      // navigate(`/admin/profile?${params.toString()}`);
      navigate('/user/profile');

    }
  };

  useEffect(() => {
    if (user.login) {
      setUserLoaded(true);
    }
  }, [user]);

  return (
    <Box flex>
      {userLoaded && (
        <>
          <Avatar
            story="default"
            onClick={goToUserProfile}
            online={true}
            src={
              user.avatar && user.avatar.startsWith("http")
                ? user.avatar
                : undefined
            }
          >
            {!user.avatar || !user.avatar.startsWith("http") ? (
              <span style={{ fontSize: "15px", fontWeight: "bold" }}>
                {avt.join("")}
              </span>
            ) : null}
          </Avatar>

          <Box ml={4} style={{ color: "black" }}>
            <Text.Title>{user.name}</Text.Title>
            <Text>{user.role}</Text>
          </Box>
        </>
      )}
    </Box>
  );
};

export default UserCard;
