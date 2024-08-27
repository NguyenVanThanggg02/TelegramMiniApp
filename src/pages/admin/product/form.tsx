import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Button,
  Icon,
  Input,
  Box,
  Page,
  useSnackbar,
  Select,
  Switch,
  ImageViewer,
} from "zmp-ui";

import { useNavigate, useParams } from "react-router-dom";

import { useRecoilState, useRecoilValue } from "recoil";
import { userState, storeState } from "../../../state";

import { formatNumberToVND } from "../../../utils/numberFormatter";

import {
  sendCreateProductRequest,
  fetchProductDetails,
  sendUpdateProductRequest,
  getCategoryByStore,
  uploadImages,
} from "../../../api/api";

const { Option } = Select;

import { useTranslation } from "react-i18next";


interface ProductForm {
  name: string;
  describe: string;
  price: string;
  selectedStore?: string;
  selectedCategories: string[];
  image?: string;
}

interface ErrorForm {
  name?: string;
  describe?: string;
  price?: string;
  image?: string;
  selectedCategories?: string;
}

interface ProductPayload {
  product: {
    uuid?: string;         
    cat_uuids: string[];
    store_uuid: string | undefined;
    name: string;
    describe: string;
    status: string;
    price: number;
    image_uuids: string[];
  };
}

interface Category {
  uuid: string;
  name: string;
}
interface ImageData {
  src: string;
  alt: string;
  key: string;
  file?: File; 
  uuid?: string; 
}

const ProductFormPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid, product_uuid } = useParams<{ store_uuid?: string; product_uuid?: string }>();
  const [form, setForm] = useState<ProductForm>({
    name: "",
    describe: "",
    price: "",
    selectedStore: "",
    selectedCategories: [],
  });
  const [errorForm, setErrorForm] = useState<ErrorForm>({});

  const snackbar = useSnackbar();

  const [user, ] = useRecoilState(userState);
  const store = useRecoilValue(storeState);

  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const navigate = useNavigate();

  const [showButtonStatus, setShowButtonStatus] = useState<boolean>(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [imageUUIDs, setImageUUIDs] = useState<string[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);



  useEffect(() => {
    sendRequestGetCategory();
  }, []);

  const handleChangeInput = (field: keyof ProductForm, value: string | string[] | undefined) => {
    const newErrors = { ...errorForm };
    // delete newErrors[field];
    setErrorForm(newErrors);
  
    if (value === undefined) {
      return; 
    }
  
    // Xử lý theo kiểu data của field
    switch (field) {
      case "selectedStore":
        setForm((prevForm) => ({
          ...prevForm,
          selectedStore: value as string, 
          selectedCategories: [], 
        }));
        break;
  
      case "price":
        const formattedValue = formatNumberToVND(value as string); 
        setForm((prevForm) => ({
          ...prevForm,
          price: formattedValue,
        }));
        break;
  
      case "selectedCategories":
        // Chuyển value sang kiểu string[]
        const selectedCategories = Array.isArray(value) ? value : [];
        setForm((prevForm) => ({
          ...prevForm,
          selectedCategories,
        }));
        break;
  
      default:
        setForm((prevForm) => ({
          ...prevForm,
          [field]: value,
        }));
        break;
    }
  };
  
  useEffect(() => {
    if (product_uuid && product_uuid !== "null") {
      loadProductDetails(product_uuid);
    } else {
      console.log(`create new product`);
    }
  }, []);

  const handleCheckboxChange = () => {
    setShowButtonStatus((prevStatus) => !prevStatus);
  };


  const removeImage = (index: any) => {
    const updatedImages = [...images];
    const updatedImageUUIDs = [...imageUUIDs];

    updatedImages.splice(index, 1); // Xóa ảnh khỏi mảng images
    updatedImageUUIDs.splice(index, 1); // Xóa uuid tương ứng khỏi mảng imageUUIDs

    setImages(updatedImages);
    setImageUUIDs(updatedImageUUIDs);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
  
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const newImages = fileArray.map((file) => {
        const reader = new FileReader();
        return new Promise<{ src: string; file: File }>((resolve, reject) => {
          reader.onloadend = () => {
            resolve({ src: reader.result as string, file });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
  
      try {
        const imageData = await Promise.all(newImages);
        const imageObjects = imageData.map(({ src, file }) => ({
          src,
          alt: `Preview image ${file.name}`,
          key: file.name,
          file
        }));
  
        setImages((prevImages) => [...prevImages, ...imageObjects]);
  
        const response = await uploadImages(store.uuid, user.uuid, fileArray);
        console.log("Upload successful:", response);
  
        const uuids = response.data.data?.uuids || [];
        console.log("uuids", uuids);
        const urls = response.data.data?.urls || []; // Đảm bảo backend trả về URL
        console.log("urls", urls);

        const uploadedImages = imageObjects.map((img, index) => ({
          ...img,
          uuid: uuids[index], 
          src: urls[index] 
        }));
  
        setImages((prevImages) =>
          prevImages
            .filter(img => img.uuid) 
            .concat(uploadedImages) 
        );
        setImageUUIDs((prevUUIDs) => [
          ...prevUUIDs,
          ...uuids
        ]);
  
        console.log("Updated Images with UUIDs:", [...images, ...uploadedImages]);
        
      } catch (error) {
        console.error("Upload failed:", error);
      }
    } else {
      console.log("No files selected.");
    }
  };
  const loadProductDetails = async (product_uuid: string) => {
    const data = await fetchProductDetails(product_uuid);
    if (!data?.error && data.data) {  
      const product = data.data; 

      console.log("Product details:", product);

      setForm({
        name: product.name,
        describe: product.describe,
        price: formatNumberToVND(product.price),
        selectedStore: product.store_uuid,
        selectedCategories: product.categories.map((cat) => cat.uuid) || [],
      });

      if (data.status == "not_show") {
        setShowButtonStatus(false);
      } else {
        setShowButtonStatus(true);
      }

      const newData = product.images.map((image, index) => ({
        src: image.url,
        alt: `img ${product.images.length + index + 1}`,
        key: `${product.images.length + index + 1}`,
      }));

      // Kiểm tra nếu data.uuids không phải null hoặc undefined
      const newImageUUIDs = product.images.map((image) => image.uuid);

      setImages([...images, ...newData]);
      setImageUUIDs([...imageUUIDs, ...newImageUUIDs]);
    } else {
      console.error("Error fetching product details:", data.error);
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.fetchProductDetailFail"),
        type: "error",
      });
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: ErrorForm = {};


    if (!form.name) {
      isValid = false;
      newErrors.name = t(
        "productManagement.createProduct.messageErrorProductName",
      );
    }

    if (!form.describe) {
      isValid = false;
      newErrors.describe = t(
        "productManagement.createProduct.messageErrorProductDescription",
      );
    }

    if (!form.price) {
      isValid = false;
      newErrors.price = t(
        "productManagement.createProduct.messageErrorProductPrice",
      );
    }

    if (!images.length) {
      isValid = false;
      newErrors.image = t(
        "productManagement.createProduct.messageErrorProductImage",
      );
    }

    if (!form.selectedCategories.length) {
      isValid = false;
      newErrors.selectedCategories = t(
        "productManagement.createProduct.messageErrorProductCategory",
      );
    }

    setErrorForm(newErrors);

    return isValid;
  };

  const handleSubmit = () => {
    console.log(images);
    if (!validateForm()) return;
    if (product_uuid && product_uuid !== "null") {
      updateProduct();
    } else {
      createProduct();
    }
  };

  const createProduct = async () => {
    const payload = buildPayload();

    const data = await sendCreateProductRequest(payload);
    if (!data?.error) {
      console.log("Product created:", data);
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.productCreateSuccess"),
        type: "success",
      });
      navigate(-1);
    } else {
      console.error("Error:", data.error);
      snackbar.openSnackbar({
        duration: 3000,
        text:
          typeof data.error === "string"
            ? data.error
            : t("snackbarMessage.productCreateFail"),
        type: "error",
      });
    }
  };

  const updateProduct = async () => {
    let payload = buildPayload();
    payload.product.uuid = product_uuid;

    const data = await sendUpdateProductRequest(payload);
    if (!data?.error) {
      console.log("updated:", data);
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.productUpdateSuccess"),
        type: "success",
      });
      navigate(-1);
    } else {
      console.error("Error:", data.error);
      snackbar.openSnackbar({
        duration: 3000,
        text:
          typeof data.error === "string"
            ? data.error
            : t("snackbarMessage.productUpdateFail"),
        type: "error",
      });
    }
  };

  const buildPayload = (): ProductPayload => {
      console.log("Images:", images);
    
    return {
      product: {
        cat_uuids: form.selectedCategories,
        store_uuid: store_uuid,
        name: form.name,
        describe: form.describe,
        status: showButtonStatus ? "show_now" : "not_show",
        price: parseInt(form.price.replace(/\D/g, ""), 10),
        image_uuids: images.map((img) => img.uuid || ""), 
      },
    };
  }; 

  const sendRequestGetCategory = async () => {
    const response = await getCategoryByStore(store_uuid);
  
    if (!response?.error && response.data) {
      setCategoryList(response.data);  
    } else {
      console.error("Error:", response.error);
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.getCatFail"),
        type: "countdown",
      });
    }
  };
  return (
    <Page className="page">
      <div className="section-container">
        <Box>
          <Box>
            <Input
              id="name"
              label={t("productManagement.createProduct.productName")}
              type="text"
              placeholder={t(
                "productManagement.createProduct.productNameEnter"
              )}
              value={form?.name}
              onChange={(e) => handleChangeInput("name", e.target.value)}
              errorText={errorForm?.name || ""}
              status={errorForm?.name ? "error" : ""}
              showCount
              maxLength={20}
            />

            <Input.TextArea
              id="describe"
              label={t("productManagement.createProduct.productDescription")}
              placeholder={t(
                "productManagement.createProduct.productDescriptionEnter"
              )}
              value={form?.describe}
              onChange={(e) => handleChangeInput("describe", e.target.value)}
              showCount
              errorText={errorForm?.describe || ""}
              status={errorForm?.describe ? "error" : ""}
              maxLength={250}
            />

            <Input
              id="price"
              label={t("productManagement.createProduct.productPrice")}
              type="text" // Change to text type to allow formatting
              placeholder={t(
                "productManagement.createProduct.productPriceEnter"
              )}
              value={form?.price}
              onChange={(e) => handleChangeInput("price", e.target.value)}
              errorText={errorForm?.price || ""}
              status={errorForm?.price ? "error" : ""}
            />

            <Box mt={6}>
              {/* Select Categories */}
              <Select
                id="category"
                label={t("productManagement.createProduct.category")}
                helperText={t("productManagement.createProduct.categoryInfo")}
                placeholder={t(
                  "productManagement.createProduct.categorySelect"
                )}
                multiple
                value={form.selectedCategories}
                onChange={(values) =>
                  handleChangeInput("selectedCategories", values as string[])
                }
                errorText={errorForm?.selectedCategories || ""}
                status={errorForm?.selectedCategories ? "error" : ""}
              >
                {categoryList.map((cat) => (
                  <Option key={cat.uuid} value={cat.uuid} title={cat.name} />
                ))}
              </Select>
            </Box>
          </Box>

          <Box mt={2}>
            <Box flex flexDirection="row" flexWrap={false}>
              {images.map((img, index) => (
                <Box
                  mr={1}
                  key={index} // Sử dụng index thay vì index.key vì đây là mảng
                  style={{
                    position: "relative",
                    width: "68px",
                    height: "69px",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    role="presentation"
                    onClick={() => {
                      setActiveIndex(index);
                      setVisible(true);
                    }}
                    src={img.src}
                    alt={img.alt}
                  />
                  {/* Nút x xoá ảnh */}
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      right: "3px",
                      background: "red",
                      cursor: "pointer",
                      borderRadius: "15px",
                      color: "beige",
                      width: "22px",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => removeImage(index)}
                  >
                    X
                  </div>
                </Box>
              ))}
            </Box>
            <ImageViewer
              onClose={() => setVisible(false)}
              activeIndex={activeIndex}
              images={images}
              visible={visible}
            />
          </Box>

          <Box mt={6}>
            <Button
              fullWidth
              variant="primary"
              onClick={() => document.getElementById("chooseFile")?.click()}
            >
              <Icon icon="zi-camera" />{" "}
              {t("productManagement.createProduct.uploadImage")}
            </Button>
            <input
              type="file"
              hidden
              id="chooseFile"
              onChange={handleFileChange}
            />
            {errorForm.image && (
              <Box
                flex
                alignItems="center"
                className="zaui-input-helper-text zaui-input-helper-text-has-error"
                mt={1}
              >
                <Icon
                  icon="zi-warning-solid"
                  size={16}
                  className="zaui-input-helper-text-icon"
                />{" "}
                {errorForm.image}
              </Box>
            )}
          </Box>

          <Box mt={6}>
            <Box>
              <Switch
                checked={showButtonStatus}
                label={t("productManagement.createProduct.display")}
                onChange={handleCheckboxChange}
              />
            </Box>
          </Box>

          <Box mt={4}>
            <Button fullWidth variant="primary" onClick={handleSubmit}>
              {t("productManagement.createProduct.submit")}
            </Button>
          </Box>
        </Box>
      </div>
    </Page>
  );
};

export default ProductFormPage;
