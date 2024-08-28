// const sendPhotoToTelegram = async (base64) => {
//     // Chuyển đổi base64 thành Blob
//     const response = await fetch(data:image/png;base64,${base64});
//     const blob = await response.blob();
//     const file = new File([blob], "image.png", { type: "image/png" });
  
//     const formData = new FormData();
//     formData.append('photo', file);
  
//     try {
//       // Gửi ảnh đến Telegram
//       const response = await fetch('https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendPhoto', {
//         method: 'POST',
//         body: formData,
//       });
  
//       const result = await response.json();
  
//       if (result.ok) {
//         const fileId = result.result.photo.pop().file_id;
        
//         // Lấy link tải ảnh từ file_id
//         const getFileResponse = await fetch(https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getFile?file_id=${fileId});
//         const fileResult = await getFileResponse.json();
  
//         if (fileResult.ok) {
//           const filePath = fileResult.result.file_path;
//           const fileUrl = https://api.telegram.org/file/bot<YOUR_BOT_TOKEN>/${filePath};
  
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