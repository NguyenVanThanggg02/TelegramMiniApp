// const sendPhotoToTelegram = async (base64: string): Promise<void> => {
//     try {
//       // Chuyển đổi base64 thành Blob
//       const response = await fetch(`data:image/png;base64,${base64}`);
//       const blob = await response.blob();
//       const file = new File([blob], "image.png", { type: "image/png" });
  
//       const formData = new FormData();
//       formData.append('photo', file);
  
//       // Gửi ảnh đến Telegram
//       const sendResponse = await fetch('https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendPhoto', {
//         method: 'POST',
//         body: formData,
//       });
  
//       const result = await sendResponse.json();
  
//       if (result.ok) {
//         const fileId: string = result.result.photo.pop().file_id;
        
//         // Lấy link tải ảnh từ file_id
//         const getFileResponse = await fetch(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getFile?file_id=${fileId}`);
//         const fileResult = await getFileResponse.json();
  
//         if (fileResult.ok) {
//           const filePath: string = fileResult.result.file_path;
//           const fileUrl: string = `https://api.telegram.org/file/bot<YOUR_BOT_TOKEN>/${filePath}`;
  
//           console.log('Image URL:', fileUrl);
  
//           // Tải ảnh về từ link
//           const downloadResponse = await fetch(fileUrl);
//           const imageBlob = await downloadResponse.blob();
  
//           // Tạo link download
//           const downloadLink = URL.createObjectURL(imageBlob);
//           console.log('Download Link:', downloadLink);
//         } else {
//           console.error('Error getting file path from Telegram:', fileResult.description);
//         }
//       } else {
//         console.error('Error sending image to Telegram:', result.description);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };
  




// import React, { useEffect, useState } from "react";
// import {
//   Page,
//   List,
//   Button,
//   Box,
//   Text,
//   // useSnackbar,
// } from "zmp-ui";
// import { useRecoilState } from "recoil";
// import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import {
//   loadingState,
//   // spinnerState,
//   storeListState,
//   // userState,
// } from "../../../state";
// import { fetchTablesForStore } from "../../../api/api";
// import AddTableForm from "../../../components/table-admin/add_table_form";
// import QRCodeViewer from "@/components/qr/viewer";
// import { APP_VERSION } from "../../../constants";
// import QrCodeOutlinedIcon from "@mui/icons-material/QrCodeOutlined";
// import tableIcon from "../../../static/icons/table.png";
// import "./styles.scss";
// // import { useTranslation } from "react-i18next";
// // import QRCodeMultiplyViewer from "../../../components/qr/multiplyViewer";
// import { createTenantURL } from "../../../api/urlHelper";
// // import { domToPng } from "modern-screenshot";

// interface Table {
//   uuid: string;
//   name: string;
//   link: string;
// }

// const TablePage: React.FC = () => {
//   // const { t } = useTranslation("global");
//   const { store_uuid } = useParams<{ store_uuid?: string }>(); // Lấy store_uuid từ URL
//   const [searchParams] = useSearchParams();
//   const tenant_id = searchParams.get("tenant_id");
//   const navigate = useNavigate();

//   if (!store_uuid) {
//     return <div>Error: Store UUID is missing</div>;
//   }

//   const [tables, setTables] = useState<Table[]>([]);
//   // const user = useRecoilValue(userState);
//   const [selectedTableUUID, setSelectedTableUUID] = useState<string | null>(
//     null
//   );
//   const [loading, setLoading] = useRecoilState(loadingState);
//   const [storeList, setStoreListState] = useRecoilState(storeListState);
//   // const snackbar = useSnackbar();
//   // const [, setSpinner] = useRecoilState(spinnerState);

//   const handleTableAdded = () => {
//     fetchTableData();
//     setStoreListState({
//       is_update: false,
//       stores: [...storeList.stores],
//     });
//   };

//   useEffect(() => {
//     setLoading({ ...loading, isLoading: true });
//     fetchTableData();
//   }, [store_uuid]);

//   const fetchTableData = async () => {
//     try {
//       const response = await fetchTablesForStore(store_uuid);

//       if (!response.error && Array.isArray(response.data)) {
//         const listTables = response.data.map((tab) => ({
//           ...tab,
//           link: linkBuilder(tab.uuid),
//         }));
//         setTables(listTables);
//       } else {
//         console.error("Lỗi khi lấy dữ liệu bảng:", response.error);
//       }
//     } catch (error) {
//       console.error("Lỗi không mong muốn:", error);
//     } finally {
//       setLoading({ ...loading, isLoading: false });
//     }
//   };

//   const linkBuilder = (table_uuid: string): string => {
//     const url = createTenantURL();
//     let qr_url = ${url}/redirect?tableId=${table_uuid}&storeId=${store_uuid}&version=${APP_VERSION}&tenantId=${tenant_id};

//     return qr_url;
//   };

//   const goToTableDetails = (tableUUID: string, tableName: string) => {
//     navigate({
//       pathname: /admin/table/form/${store_uuid}/${tableUUID},
//       search: ?table_name=${tableName},
//     });
//   };

//   // const handleSaveQr = async (element: React.RefObject<HTMLDivElement>) => {
//   //   if (element.current) {
//   //     setSpinner(true);
//   //     element.current.style.fontFamily = "Montserrat";
//   //     try {
//   //       const dataUrl = await domToPng(element.current, { scale: 3 });
//   //       downloadImage(dataUrl, "hehe");
//   //       alert("success");
//   //     } catch (error) {
//   //       console.error("Error saving QR code:", error);
//   //     } finally {
//   //       setSpinner(false);
//   //     }
//   //   }
//   // };

//   // const downloadImage = (blob: string, fileName: string): void => {
//   //   const fakeLink = document.createElement("a");
//   //   fakeLink.style.display = "none";
//   //   fakeLink.download = fileName;

//   //   fakeLink.href = blob;
//   //   document.body.appendChild(fakeLink);
//   //   fakeLink.click();
//   //   document.body.removeChild(fakeLink);
//   //   fakeLink.remove();
//   // };


//   const sendPhotoToTelegram = async (base64: string): Promise<void> => {
//     try {
//       // Chuyển đổi base64 thành Blob
//       const response = await fetch(data:image/png;base64,${base64});
//       const blob = await response.blob();
//       const file = new File([blob], "image.png", { type: "image/png" });
  
//       const formData = new FormData();
//       formData.append('photo', file);
  
//       // Gửi ảnh đến Telegram
//       const sendResponse = await fetch('https://api.telegram.org/bot<7274693550:AAFsK44G2wDoCM-jeJeOL_6GWPI1I6Mact0>/sendPhoto', {
//         method: 'POST',
//         body: formData,
//       });
  
//       const result = await sendResponse.json();
  
//       if (result.ok) {
//         const fileId: string = result.result.photo.pop().file_id;
        
//         // Lấy link tải ảnh từ file_id
//         const getFileResponse = await fetch(https://api.telegram.org/bot<7274693550:AAFsK44G2wDoCM-jeJeOL_6GWPI1I6Mact0>/getFile?file_id=${fileId});
//         const fileResult = await getFileResponse.json();
  
//         if (fileResult.ok) {
//           const filePath: string = fileResult.result.file_path;
//           const fileUrl: string = https://api.telegram.org/file/bot<7274693550:AAFsK44G2wDoCM-jeJeOL_6GWPI1I6Mact0>/${filePath};
  
//           console.log('Image URL:', fileUrl);
  
//           // Tải ảnh về từ link
//           const downloadResponse = await fetch(fileUrl);
//           const imageBlob = await downloadResponse.blob();
  
//           // Tạo link download
//           const downloadLink = URL.createObjectURL(imageBlob);
//           console.log('Download Link:', downloadLink);
//         } else {
//           console.error('Error getting file path from Telegram:', fileResult.description);
//         }
//       } else {
//         console.error('Error sending image to Telegram:', result.description);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };
  

//   return (
//     <Page className="page">
//       <div className="section-container">
//         <AddTableForm store_uuid={store_uuid} onTableAdded={handleTableAdded} />
//         <List style={{ marginBottom: "60px" }}>
//           {tables.map((table, index) => (
//             <Box key={index}>
//               <Box
//                 className="table-card-container"
//                 onClick={() => goToTableDetails(table.uuid, table.name)}
//               >
//                 <img className="table-img" src={tableIcon}></img>
//                 <Box>
//                   <Box flex flexDirection="column">
//                     <Text
//                       size="xLarge"
//                       bold
//                       style={{ marginLeft: "10px", color: "black" }}
//                     >
//                       {table.name}
//                     </Text>
//                   </Box>
//                 </Box>
//                 <Button
//                   icon={<QrCodeOutlinedIcon />}
//                   className="qr-icon"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedTableUUID(
//                       selectedTableUUID === table.uuid ? "" : table.uuid
//                     );
//                   }}
//                 ></Button>
//               </Box>
//               <Box>
//                 {selectedTableUUID === table.uuid && (
//                   <QRCodeViewer
//                     value={table.link}
//                     title={table.name.toUpperCase()}
//                     sendPhotoToTelegram={sendPhotoToTelegram} // Truyền hàm vào QRCodeViewer
//                   />
//                 )}
//               </Box>
//             </Box>
//           ))}
//         </List>
//         {/* {tables?.length > 0 && (
//           <QRCodeMultiplyViewer listItems={tables} sendPhotoToTelegram={sendPhotoToTelegram} // Truyền hàm vào QRCodeViewer
//           />
//         )} */}
//       </div>
//     </Page>
//   );
// };

// export default TablePage;
//  import React, { useRef } from "react";
// import QRCode from "qrcode.react";
// import "./styles.scss";
// import { Box, Button, Text } from "zmp-ui";
// import { useTranslation } from "react-i18next";
// import appIcon from "../../static/icons/app-logo.png";
// import appIconFull from "../../static/icons/web-icon-full.png";
// import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
// import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
// import ChecklistIcon from "@mui/icons-material/Checklist";

// interface QRCodeViewerProps {
//   value: string;
//   title: string;
//   sendPhotoToTelegram: (base64: string) => Promise<void>;
// }

// const QRCodeViewer: React.FC<QRCodeViewerProps> = ({ value, title, sendPhotoToTelegram }) => {
//   const { t } = useTranslation("global");
//   const exportRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;

//   const handleSaveQr = async () => {
//     if (exportRef.current) {
//       try {
//         const canvas = document.createElement("canvas");
//         const context = canvas.getContext("2d");
//         const svg = exportRef.current.querySelector("svg");

//         if (svg && context) {
//           const svgData = new XMLSerializer().serializeToString(svg);
//           const img = new Image();
//           img.src = "data:image/svg+xml;base64," + btoa(svgData);

//           img.onload = async () => {
//             canvas.width = img.width;
//             canvas.height = img.height;
//             context.drawImage(img, 0, 0);

//             const base64 = canvas.toDataURL("image/png").replace("data:image/png;base64,", "");

//             // Gọi hàm sendPhotoToTelegram với base64
//             await sendPhotoToTelegram(base64);
//           };
//         }
//       } catch (error) {
//         console.error("Error converting QR code to image:", error);
//       }
//     }
//   };

//   return (
//     <Box className="qr-code-container">
//       <Box className="qr-code-content" mb={3} ref={exportRef}>
//         <Box className="top-qr-container">
//           <Box
//             style={{
//               padding: "14px 38px",
//               paddingBottom: "8px",
//               height: "223px",
//             }}
//           >
//             <Box style={{ marginBottom: "4px" }}>
//               <Text className="scan-qr-title">
//                 {t("tableManagement.scanQrTable")}
//               </Text>
//               <Text className="qr-code-menu">{t("tableManagement.menu")}</Text>
//             </Box>
//             <Box className="qr-container">
//               <QRCode
//                 value={value}
//                 renderAs="svg"
//                 imageSettings={{
//                   src: appIcon,
//                   height: 24,
//                   width: 24,
//                   excavate: true,
//                 }}
//               />
//             </Box>
//           </Box>
//           <Box className="list-sub-item-container">
//             <Box className="sub-item-container">
//               <Box className="sub-item-qr">
//                 <QrCodeScannerIcon style={{ fontSize: "20px" }} />
//               </Box>
//               {t("tableManagement.scanQr")}
//             </Box>
//             <Box className="sub-item-container">
//               <Box className="sub-item-qr">
//                 <RestaurantMenuIcon style={{ fontSize: "20px" }} />
//               </Box>
//               {t("tableManagement.viewMenu")}
//             </Box>
//             <Box className="sub-item-container">
//               <Box className="sub-item-qr">
//                 <ChecklistIcon style={{ fontSize: "20px" }} />
//               </Box>
//               {t("tableManagement.order")}
//             </Box>
//           </Box>
//         </Box>
//         <Box
//           flex
//           alignItems="center"
//           justifyContent="flex-end"
//           className="bottom-qr-container"
//           style={{ paddingRight: "5px" }}
//         >
//           <Box className="txt-table-name">
//             <Box className="table-name-container">
//               <span style={{ whiteSpace: "nowrap" }}>{title}</span>
//             </Box>
//           </Box>
//           <Box className="img-app-icon-container">
//             <img src={appIconFull} className="img-app-icon"></img>
//           </Box>
//         </Box>
//       </Box>
//       <Button onClick={handleSaveQr}>{t("button.save")}</Button>
//     </Box>
//   );
// };

// export default QRCodeViewer