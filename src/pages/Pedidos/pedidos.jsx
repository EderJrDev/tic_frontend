import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import PerfectScrollbar from "react-perfect-scrollbar";

import { format } from "date-fns";
import { api } from "../../utils/api";

import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

function CustomerOrder() {
  const [posMobileSidebarToggled, setPosMobileSidebarToggled] = useState(false);

  const [cli, setCli] = useState([]);
  const [order, setOrder] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [pedidoQuantidade, setPedidoQuantidade] = useState(0);
  const [estoqueQuantidade, setEstoqueQuantidade] = useState(0);
  const [selectedCardQuantity, setSelectedCardQuantity] = useState("");
  const [selectedProduct, setSelectedProduct] = useState({
    id: null,
    name: "",
    quantity: 0,
    quantityToAdd: 0,
  });

  const toast = useRef(null);

  const showSuccess = () => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Message Content",
      life: 3000,
    });
  };

  const showError = () => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Message Content",
      life: 3000,
    });
  };

  const handleCardClick = (item) => {
    setSelectedCardQuantity(item.quantity);
    setShowModal(true);
    setSelectedProduct({ ...item, quantityToAdd: "" }); // Add the quantityToAdd property
  };

  const updateProduct = () => {
    // console.log(selectedProduct);

    const updatedOrders = [...orders];
    updatedOrders.push({
      id: selectedProduct.id,
      product: selectedProduct.name,
      quantityInStock: selectedCardQuantity, // Use selectedCardQuantity instead of selectedQuantityToAdd
      newQuantity: quantityToAdd, // Use selectedCardQuantity instead of selectedQuantityToAdd
    });
    setOrders(updatedOrders);
    setShowModal(false);
    setQuantityToAdd("");

    console.log(orders);

    setSelectedProduct({ ...selectedProduct, quantityToAdd: "" }); // Reset the quantityToAdd property
    setQuantityToAdd("");
  };

  useEffect(() => {
    async function getCategory() {
      const response = await api.get("/admin/product");
      const dados = response.data;
      setCli(dados);
    }
    getCategory();
  }, []);

  useEffect(() => {
    async function getOrder() {
      const response = await api.get("/admin/order");
      const dados = response.data;
      console.log(response);
      setOrder(dados);
    }
    getOrder();
  }, []);

  useEffect(() => {
    async function sendOrder() {
      const response = await api.get("/admin/product");
      const dados = response.data;
      setCli(dados);
    }
    sendOrder();
  }, []);

  const calcularTotais = () => {
    let totalPedidoQuantidade = 0;
    let totalEstoqueQuantidade = 0;

    console.log(orders);

    orders.forEach((order) => {
      totalPedidoQuantidade += order.quantity;
      // Adicione aqui qualquer lógica adicional para calcular o total de itens em estoque, se necessário

      // Exemplo de cálculo da quantidade em estoque:
      totalEstoqueQuantidade += quantityToAdd;
    });

    setPedidoQuantidade(totalPedidoQuantidade);
    setEstoqueQuantidade(totalEstoqueQuantidade);
  };

  useEffect(() => {
    calcularTotais();
  }, [orders]); // Recalcula os totais sempre que o array 'orders' for alterado

  async function handleSubmit(event) {
    event.preventDefault();
    // console.log(orders);

    const date = new Date();
    const today = format(date, "yyyy-MM-dd");

    // Prepare the data in the required JSON format
    const orderData = {
      name: "ORDER TESTE",
    };

    try {
      const response = await api.post("/admin/order/createOrder", orderData);

      // console.log(response);
      // console.log(orders);

      const orderItem = {
        order_items: [
          orders.map((order) => ({
            status: "pendente",
            expected_date: today,
            orderId: response.data.createdOrder.id,
            productId: order.id,
            quantityInStock: parseFloat(order.quantityInStock),
            newQuantity: parseFloat(order.newQuantity),
          })),
        ],
      };

      console.log(orderItem);

      const responseOrder = await api.post(
        "/admin/order/createOrderItem",
        orderItem
      );
      // showSuccess();
      console.log(responseOrder);
      // console.log("Ordem criada com sucesso!!");
    } catch (error) {
      showError();
      console.error("Failed to submit order:", error);
    }
  }

  return (
    <div className="vh-100">
      <Toast ref={toast} />
      <div
        className={`pos pos-customer ${
          posMobileSidebarToggled ? "pos-mobile-sidebar-toggled" : ""
        }`}
        id="pos-customer"
      >
        <div className="pos-content">
          <PerfectScrollbar
            className="pos-content-container"
            options={{ suppressScrollX: true }}
          >
            <div className="product-row">
              <div className="col-lg-12">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <a
                      href="#default-tab-1"
                      data-bs-toggle="tab"
                      className="nav-link active"
                    >
                      <span className="d-sm-none">Itens</span>
                      <span className="d-sm-block d-none">Itens</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      href="#default-tab-2"
                      data-bs-toggle="tab"
                      className="nav-link"
                    >
                      <span className="d-sm-none">Pedidos</span>
                      <span className="d-sm-block d-none">Pedidos</span>
                    </a>
                  </li>
                </ul>

                <div className="tab-content panel rounded-0 p-3 m-0">
                  <div className="tab-pane fade active show" id="default-tab-1">
                    <div className="invoice-header">
                      <div className="invoice-from">
                        <div className="d-flex row">
                          {cli.map((item) => (
                            <div className="col-lg-4 pb-3" key={item.id}>
                              <div className="container" data-type="meat">
                                <Link
                                  className="product bg-gray-100"
                                  data-bs-target="#"
                                  onClick={() => handleCardClick(item)}
                                >
                                  <div className="text">
                                    <div className="title">{item.name}</div>
                                    <div className="desc">
                                      Categoria: {item.location}
                                    </div>
                                    <div className="price">
                                      Quantidade: {item.quantity}
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* </div> */}
                    </div>
                  </div>
                  <div className="tab-pane fade" id="default-tab-2">
                    <h1 className="page-header">order</h1>
                  </div>
                </div>
              </div>
            </div>

            <Dialog
              modal
              maximizable
              header="Novo Pedido"
              visible={showModal}
              onHide={() => setShowModal(false)}
              style={{ width: "50vw" }}
              // contentStyle={{ height: '300px' }}
            >
              <div className="row">
                <div className="col-lg-6">
                  <p className="m-auto pb-2">Quantidade em Estoque:</p>
                  <InputText
                    type="number"
                    className="p-inputtext-sm w-100"
                    value={selectedProduct ? selectedProduct.quantity : ""}
                  />
                </div>
                <div className="col-lg-6">
                  <p className="m-auto pb-2">Quantidade a Ser Adicionada:</p>
                  <InputText
                    type="number"
                    placeholder="0"
                    value={quantityToAdd}
                    className="p-inputtext-sm w-100"
                    onChange={(e) => setQuantityToAdd(e.target.value)}
                  />
                </div>
                <div className="col-lg-12 pt-4">
                  <div className="text-center">
                    <button
                      className="btn btn-info btn-btn-sm"
                      onClick={updateProduct}
                    >
                      <i className="bi bi-check-circle-fill"></i> Atualizar
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
          </PerfectScrollbar>
        </div>
        <div className="pos-sidebar" id="pos-sidebar">
          <div className="pos-sidebar-nav">
            <ul className="nav nav-tabs nav-fill">
              <li className="nav-item">
                <Link to="/pos/customer-order" className="nav-link active">
                  Novo Pedido
                </Link>
              </li>
            </ul>
          </div>
          <div
            className="pos-sidebar-body tab-content"
            data-scrollbar="true"
            data-height="100%"
          >
            <div className="tab-pane fade h-100 show active" id="newOrderTab">
              <div className="pos-table">
                <div className="text-center">
                  <p>Selecione um item para adicionar ao pedido.</p>
                </div>
                {orders.map((order, index) => (
                  <div
                    className="row pos-table-row justify-content-between"
                    key={index}
                  >
                    <div className="title d-none">{order.id}</div>
                    <div className="row pos-table-row" key={index}>
                      <div className="pos-product-thumb">
                        <div className="info">
                          <div className="title">Produto: {order.product}</div>
                        </div>
                      </div>
                      <div className="pos-product-thumb">
                        <div className="d-none">{order.id}</div>
                      </div>
                      <div className="pos-product-thumb py-1">
                        <div className="info">
                          <div className="title pb-1">
                            Quantidade em Estoque:
                            <span className="font-weight-bold text-danger">
                              {order.quantityInStock}
                            </span>
                          </div>
                          <div className="title">
                            Nova Quantidade:{" "}
                            <span className="font-weight-bold text-success">
                              {order.newQuantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pos-sidebar-footer">
              <div className="subtotal">
                <div className="text">Quantidade de Itens:</div>
                <div className="price">{estoqueQuantidade}</div>
              </div>
              <div className="btn-row">
                <form onSubmit={handleSubmit}>
                  <button type="submit" className="btn btn-success">
                    <i className="fa fa-check fa-fw fa-lg"></i> Finalizar Pedido
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerOrder;