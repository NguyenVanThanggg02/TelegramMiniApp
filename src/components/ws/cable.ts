import { BASE_SOCKET_URL } from "../../constants";
import { createConsumer, Consumer } from "@rails/actioncable";

const createCable = (
  authToken: string, 
  store_uuid: string, 
  subdomain: string
): Consumer => {
  const url = new URL(BASE_SOCKET_URL);
  const { protocol, hostname, pathname } = url;
  const new_url = `${protocol}//${subdomain}.${hostname}${pathname}`;

  return createConsumer(
    `${new_url}?auth_token=${authToken}&store_uuid=${store_uuid}`,
  );
};

export default createCable;
