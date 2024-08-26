import React, { useEffect, useState } from 'react';
import { Avatar, Box, Text } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { userState } from '../state';
import { useNavigate } from 'react-router-dom';

interface UserCardProps {
  isAdmin?: boolean;
  showOrderHistory?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ isAdmin = false, showOrderHistory = true }) => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const [userLoaded, setUserLoaded] = useState(false);

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
            online
            src={user.avatar.startsWith('http') ? user.avatar : undefined}
            onClick={goToUserProfile}
          >
            {user.avatar}
          </Avatar>
          <Box ml={4} style={{color:'black'}}>
            <Text.Title>{user.name}</Text.Title>
            <Text>{user.role}</Text>
          </Box>
        </>
      )}
    </Box>
  );
};

export default UserCard;
