import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Page,
  Box,
  Button,
  Text,
} from "zmp-ui";
import { useRecoilState, } from "recoil";
import AddCategoryForm from "../../../components/category-admin/add_category_form";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { loadingState, storeListState } from "../../../state";
import {
  deleteCategory,
  getCategoryByStore,
  sortCategory,
} from "../../../api/api";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import catIcon from "../../../static/icons/application.png";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ConfirmModal from "../../../components/modal/confirmModal";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Snackbar } from "@telegram-apps/telegram-ui";

interface Category {
  name: string;
  describe?: string;
  store_uuid: string;
  uuid: string;
  index: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string | unknown;
}

const CategoryPage: React.FC = () => {
  const { t } = useTranslation("global");
  const { store_uuid } = useParams<{ store_uuid: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useRecoilState(loadingState);
  const [storeList, setStoreListState] = useRecoilState(storeListState);
  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  

  const handleCategoryAdded = () => {
    fetchCategoryData();
    setStoreListState({
      is_update: false,
      stores: [...storeList.stores],
    });
  };

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    fetchCategoryData();
  }, [store_uuid]);

  const fetchCategoryData = async () => {
    try {
      const response: ApiResponse<Category[]> = await getCategoryByStore(store_uuid);
      if (response.data && !response.error) {
        const sortedCategories = response.data.sort((a, b) => a.index - b.index);
        setCategories(sortedCategories);
      } else {
        console.error("Error:", response.error);
        setSnackbarMessage(t("snackbarMessage.getCatFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);

      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setSnackbarMessage(t("snackbarMessage.getCatFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);
    } finally {
      setLoading({ ...loading, isLoading: false });
    }
  };
  

  const goToCategoryDetails = (catUUID: string) => {
    console.log(`catUUID: ${catUUID}`);
    navigate(`/admin/category/form/${store_uuid}/${catUUID}`);
  };

  const onDeleteCategory = async () => {
    setIsShowConfirm(false);
    const data = await deleteCategory({
      category: {
        store_uuid: store_uuid,
        uuid: selectedCategory?.uuid,
      },
    });
    // console.log(data);
    
    if (JSON.stringify(data)) {
      fetchCategoryData();
      setSnackbarMessage(t("snackbarMessage.deleteSuccess"));
      setSnackbarType("success");
      setSnackbarOpen(true);

    } else {
      setSnackbarMessage(t("snackbarMessage.deleteFail"));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  const reorder = (list: Category[], startIndex: number, endIndex: number): Category[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };


  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    const newList = reorder(
      categories,
      result.source.index,
      result.destination.index,
    );
    setCategories([...newList]);
    const data = await sortCategory({
      store_uuid: store_uuid,
      cat_uuids: [...newList.map((c) => c.uuid)],
    });
    if (!data?.error) {
        setSnackbarMessage(t("snackbarMessage.updateCatSuccess"));
        setSnackbarType("success");
        setSnackbarOpen(true);
    } else {
      const newList = reorder(
        categories,
        result.destination.index,
        result.source.index,
      );
      setCategories([...newList]);
      setSnackbarMessage(t("snackbarMessage.updateCatFail"));
        setSnackbarType("error");
        setSnackbarOpen(true);
    }
  };

  return (
    <Page className="section-container">
      <AddCategoryForm
        store_uuid={store_uuid ?? ""}
        onCategoryAdded={handleCategoryAdded}
      />
      <ConfirmModal
        isShowModal={isShowConfirm}
        setIsShowModal={setIsShowConfirm}
        itemDelete={selectedCategory?.name}
        onConfirm={() => onDeleteCategory()}
      />
      <Box flex alignItems="center" justifyContent="center" mt={2}>
        <InfoOutlinedIcon style={{ fontSize: "20px", color:'black' }} />
        <Text className="txtDragDrop" style={{color:'black'}}>{t("categoryManagement.dragDrop")}</Text>
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {categories.length > 0 ? (
              categories.map((cat, index) => (
                <Draggable draggableId={cat.uuid} index={index} key={cat.uuid}>
                  {(provided) => (
                    <div
                      key={index}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="category-card-container"
                      onClick={() => goToCategoryDetails(cat.uuid)}
                    >
                      <img className="category-img" src={catIcon}></img>
                      <Box>
                        <Box flex flexDirection="column">
                          <Text
                            size="xLarge"
                            bold
                            style={{ marginLeft: "10px", color:'black' }}
                          >
                            {cat.name}
                          </Text>
                        </Box>
                      </Box>
                      <Button
                        icon={<DeleteForeverOutlinedIcon />}
                        className="delete-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(cat);
                          setIsShowConfirm(true);
                        }}
                      ></Button>
                    </div>
                  )}
                </Draggable>
              ))):(
                <Box
              className="order-table_empty"
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Text
                style={{ color: "rgba(0, 0, 0, 0.5)", textAlign: "center" }}
              >
                {t("main.categories")}
              </Text>
            </Box>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div style={{borderRadius:'10px', backgroundColor:'black'}}>
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

export default CategoryPage;
