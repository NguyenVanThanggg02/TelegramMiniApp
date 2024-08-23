import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Page,
  useSnackbar,
  Box,
  Button,
  Text,
} from "zmp-ui";
import { useRecoilState, } from "recoil";
import AddCategoryForm from "../../../components/category-admin/add_category_form";

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
  // const user = useRecoilValue(userState);
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useRecoilState(loadingState);
  const [storeList, setStoreListState] = useRecoilState(storeListState);
  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);


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
        snackbar.openSnackbar({
          duration: 10000,
          text: t("snackbarMessage.getCatFail"),
          type: "countdown",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      snackbar.openSnackbar({
        duration: 10000,
        text: t("snackbarMessage.getCatFail"),
        type: "countdown",
      });
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
    if (!data?.error) {
      fetchCategoryData();
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.deleteSuccess"),
        type: "success",
      });
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text:
          typeof data.error === "string"
            ? data.error
            : t("snackbarMessage.deleteFail"),
        type: "error",
      });
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
      snackbar.openSnackbar({
        duration: 3000,
        text: t("snackbarMessage.updateCatSuccess"),
        type: "success",
      });
    } else {
      const newList = reorder(
        categories,
        result.destination.index,
        result.source.index,
      );
      setCategories([...newList]);
      snackbar.openSnackbar({
        duration: 3000,
        text: String(data.error),
        type: "error",
      });
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
        <InfoOutlinedIcon style={{ fontSize: "20px" }} />
        <Text className="txtDragDrop">{t("categoryManagement.dragDrop")}</Text>
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {categories.map((cat, index) => (
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
                            style={{ marginLeft: "10px" }}
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
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Page>
  );
};

export default CategoryPage;
