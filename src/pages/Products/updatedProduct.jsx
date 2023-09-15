import { api } from "../../utils/api";
import { addNotification } from "../../utils/notifications";
import updateTableData from "./updatedTable";

export async function updatedProduct(
  id,
  name,
  category,
  quantity,
  unidadeMedida,
  location,
  setTableData,
  setDialogVisible,
  purchase_allowed,
  originCityHall
) {
  try {
    const updatedData = {
      name: name,
      categoryId: category,
      quantity: parseInt(quantity),
      measureId: unidadeMedida,
      location: location,
      purchase_allowed: purchase_allowed,
      originCityHall: originCityHall,
    };

    console.log(updatedData);

    await api.put(`/admin/product/${id}`, updatedData);

    addNotification(
      "success",
      "Produto Editado!",
      "Produto editado com sucesso.",
      "top-right"
    );
    await updateTableData(setTableData);
    setDialogVisible(false);
  } catch (error) {
    addNotification(
      "danger",
      "Atualize todos os dados!",
      "Por favor preencha todos os campos para realizar a atualização.",
      "top-right"
    );
    console.log(error);
  }
}