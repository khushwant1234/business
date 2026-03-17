"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_STATUSES, PRODUCT_CATEGORIES } from "@/lib/site";

type AdminProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string | null;
};

type AdminOrder = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryType: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
    };
  }>;
};

type AdminRequest = {
  id: string;
  productName: string;
  category: string;
  description: string;
  reason: string;
  contact: string;
  createdAt: string;
};

interface AdminTabsProps {
  initialProducts: AdminProduct[];
  initialOrders: AdminOrder[];
  initialRequests: AdminRequest[];
}

const defaultProductForm = {
  name: "",
  category: "Motors",
  description: "",
  price: "",
  imageUrl: "",
};

export default function AdminTabs({
  initialProducts,
  initialOrders,
  initialRequests,
}: AdminTabsProps) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [requests] = useState(initialRequests);
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateProductField(
    field: keyof typeof defaultProductForm,
    value: string,
  ) {
    setProductForm((current) => ({ ...current, [field]: value }));
  }

  async function handleAddProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...productForm,
        price: Number(productForm.price),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to add product.");
      return;
    }

    setProducts((current) => [payload, ...current]);
    setProductForm(defaultProductForm);
    setMessage("Product added.");
  }

  async function handleDeleteProduct(id: string) {
    setMessage(null);

    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to delete product.");
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== id));
    setMessage("Product deleted.");
  }

  async function handleStatusUpdate(orderId: string, paymentStatus: string) {
    setMessage(null);

    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to update payment status.");
      return;
    }

    startTransition(() => {
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, paymentStatus: payload.paymentStatus }
            : order,
        ),
      );
    });

    setMessage("Order updated.");
  }

  return (
    <Tabs defaultValue="products" className="space-y-6">
      <TabsList
        variant="line"
        className="w-full flex-wrap justify-start gap-2 border-b border-white/10 p-0 pb-3"
      >
        <TabsTrigger
          value="products"
          className="rounded-sm border border-white/10 px-3 py-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-[#202020]"
        >
          Products
        </TabsTrigger>
        <TabsTrigger
          value="orders"
          className="rounded-sm border border-white/10 px-3 py-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-[#202020]"
        >
          Orders
        </TabsTrigger>
        <TabsTrigger
          value="requests"
          className="rounded-sm border border-white/10 px-3 py-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-[#202020]"
        >
          Requests
        </TabsTrigger>
      </TabsList>

      {message ? <p className="text-sm text-white/70">{message}</p> : null}

      <TabsContent value="products" className="space-y-6">
        <Card className="rounded-sm border border-white/10 bg-[#202020] py-0">
          <CardHeader className="border-b border-white/10 py-4">
            <CardTitle>Add product</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={handleAddProduct}
            >
              <div className="space-y-2">
                <Label htmlFor="product-name">Name</Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={(event) =>
                    updateProductField("name", event.target.value)
                  }
                  className="rounded-sm border-white/10 bg-transparent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-category">Category</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) =>
                    updateProductField("category", value)
                  }
                >
                  <SelectTrigger
                    id="product-category"
                    className="w-full rounded-sm border-white/10 bg-transparent"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={productForm.description}
                  onChange={(event) =>
                    updateProductField("description", event.target.value)
                  }
                  className="rounded-sm border-white/10 bg-transparent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">Price</Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(event) =>
                    updateProductField("price", event.target.value)
                  }
                  className="rounded-sm border-white/10 bg-transparent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-image">Image URL</Label>
                <Input
                  id="product-image"
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(event) =>
                    updateProductField("imageUrl", event.target.value)
                  }
                  className="rounded-sm border-white/10 bg-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  className="rounded-sm"
                  disabled={isPending}
                >
                  Add Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-white/10 bg-[#202020] py-0">
          <CardHeader className="border-b border-white/10 py-4">
            <CardTitle>Current products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-sm text-white/70 hover:text-white"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders">
        <Card className="rounded-sm border border-white/10 bg-[#202020] py-0">
          <CardHeader className="border-b border-white/10 py-4">
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="align-top whitespace-normal">
                      <div className="space-y-1">
                        <p>{order.customerName}</p>
                        <p className="text-white/55">{order.phone}</p>
                        <p className="text-white/55">{order.address}</p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      {order.deliveryType}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <div className="space-y-1 text-white/75">
                        {order.items.map((item) => (
                          <p key={item.id}>
                            {item.product.name} x {item.quantity}
                          </p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <Select
                        value={order.paymentStatus}
                        onValueChange={(value) =>
                          handleStatusUpdate(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-[150px] rounded-sm border-white/10 bg-transparent">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="requests">
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="rounded-sm border border-white/10 bg-[#202020] py-0"
            >
              <CardHeader className="border-b border-white/10 py-4">
                <CardTitle>{request.productName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 text-sm text-white/75">
                <p>
                  <span className="text-white">Category:</span>{" "}
                  {request.category}
                </p>
                <p>
                  <span className="text-white">Description:</span>{" "}
                  {request.description}
                </p>
                <p>
                  <span className="text-white">Why needed:</span>{" "}
                  {request.reason}
                </p>
                <p>
                  <span className="text-white">Contact:</span> {request.contact}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
