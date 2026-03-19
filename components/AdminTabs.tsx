"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DELIVERY_STATUSES,
  PAYMENT_STATUSES,
  PRODUCT_CATEGORIES,
} from "@/lib/site";

type AdminProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string | null;
  sku: string | null;
  isInStock: boolean;
  brand: string | null;
  tags: unknown;
};

type AdminOrder = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryType: string;
  paymentStatus: string;
  deliveryStatus: string;
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
  sku: "",
  isInStock: true,
  brand: "",
  tagsInput: "",
  highlightsInput: "",
  featuresInput: "",
  packageIncludesInput: "",
  videoUrl: "",
  origin: "",
  importBy: "",
  address: "",
  customerCarePhone: "",
  customerCareEmail: "",
};

type KeyValueRow = { key: string; value: string };
type AttachmentRow = { name: string; url: string };

function parseLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminTabs({
  initialProducts,
  initialOrders,
  initialRequests,
}: AdminTabsProps) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [requests] = useState(initialRequests);
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [specRows, setSpecRows] = useState<KeyValueRow[]>([
    { key: "", value: "" },
  ]);
  const [attachmentRows, setAttachmentRows] = useState<AttachmentRow[]>([
    { name: "", url: "" },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateProductField(
    field: keyof typeof defaultProductForm,
    value: string | boolean,
  ) {
    setProductForm((current) => ({ ...current, [field]: value }));
  }

  function updateSpecRow(
    index: number,
    field: keyof KeyValueRow,
    value: string,
  ) {
    setSpecRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  function updateAttachmentRow(
    index: number,
    field: keyof AttachmentRow,
    value: string,
  ) {
    setAttachmentRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  function resetForm() {
    setProductForm(defaultProductForm);
    setSpecRows([{ key: "", value: "" }]);
    setAttachmentRows([{ name: "", url: "" }]);
  }

  async function handleAddProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const tags = productForm.tagsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const specifications = Object.fromEntries(
      specRows
        .filter((row) => row.key.trim() && row.value.trim())
        .map((row) => [row.key.trim(), row.value.trim()]),
    );

    const attachments = attachmentRows
      .filter((row) => row.name.trim() && row.url.trim())
      .map((row) => ({ name: row.name.trim(), url: row.url.trim() }));

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: productForm.name,
        category: productForm.category,
        description: productForm.description,
        price: Number(productForm.price),
        imageUrl: productForm.imageUrl,
        sku: productForm.sku,
        isInStock: productForm.isInStock,
        brand: productForm.brand,
        tags,
        highlights: parseLines(productForm.highlightsInput),
        features: parseLines(productForm.featuresInput),
        packageIncludes: parseLines(productForm.packageIncludesInput),
        specifications,
        attachments,
        videoUrl: productForm.videoUrl,
        otherInfo: {
          origin: productForm.origin,
          importBy: productForm.importBy,
          address: productForm.address,
          customerCare: {
            phone: productForm.customerCarePhone,
            email: productForm.customerCareEmail,
          },
        },
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to add product.");
      return;
    }

    setProducts((current) => [payload, ...current]);
    resetForm();
    setDialogOpen(false);
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

  async function handleStatusUpdate(
    orderId: string,
    updates: { paymentStatus?: string; deliveryStatus?: string },
  ) {
    setMessage(null);

    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to update order status.");
      return;
    }

    startTransition(() => {
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                paymentStatus: payload.paymentStatus,
                deliveryStatus: payload.deliveryStatus,
              }
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
          className="rounded-sm border border-white/10 px-3 py-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-background"
        >
          Products
        </TabsTrigger>
        <TabsTrigger
          value="orders"
          className="rounded-sm border border-white/10 px-3 py-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-background"
        >
          Orders
        </TabsTrigger>
        <TabsTrigger
          value="requests"
          className="rounded-sm border border-white/10 px-3 py-2 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-background"
        >
          Requests
        </TabsTrigger>
      </TabsList>

      {message ? <p className="text-sm text-white/70">{message}</p> : null}

      <TabsContent value="products" className="space-y-6">
        <Card className="rounded-sm border border-white/10 bg-card py-0">
          <CardHeader className="border-b border-white/10 py-4">
            <CardTitle>Add product</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" className="rounded-sm">
                  Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto rounded-sm sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Include product details, specs, and attachments.
                  </DialogDescription>
                </DialogHeader>
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
                      className="rounded-sm"
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
                        className="w-full rounded-sm"
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

                  <div className="space-y-2">
                    <Label htmlFor="product-sku">SKU</Label>
                    <Input
                      id="product-sku"
                      value={productForm.sku}
                      onChange={(event) =>
                        updateProductField("sku", event.target.value)
                      }
                      className="rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-brand">Brand</Label>
                    <Input
                      id="product-brand"
                      value={productForm.brand}
                      onChange={(event) =>
                        updateProductField("brand", event.target.value)
                      }
                      className="rounded-sm"
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
                      className="rounded-sm"
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
                      className="rounded-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-description">Description</Label>
                    <Textarea
                      id="product-description"
                      value={productForm.description}
                      onChange={(event) =>
                        updateProductField("description", event.target.value)
                      }
                      className="rounded-sm"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 md:col-span-2">
                    <Switch
                      checked={productForm.isInStock}
                      onCheckedChange={(checked) =>
                        updateProductField("isInStock", checked)
                      }
                    />
                    <Label>Is In Stock</Label>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-tags">Tags (comma-separated)</Label>
                    <Input
                      id="product-tags"
                      value={productForm.tagsInput}
                      onChange={(event) =>
                        updateProductField("tagsInput", event.target.value)
                      }
                      className="rounded-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-highlights">
                      Highlights (one per line)
                    </Label>
                    <Textarea
                      id="product-highlights"
                      value={productForm.highlightsInput}
                      onChange={(event) =>
                        updateProductField(
                          "highlightsInput",
                          event.target.value,
                        )
                      }
                      className="rounded-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-features">
                      Features (one per line)
                    </Label>
                    <Textarea
                      id="product-features"
                      value={productForm.featuresInput}
                      onChange={(event) =>
                        updateProductField("featuresInput", event.target.value)
                      }
                      className="rounded-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-includes">
                      Package Includes (one per line)
                    </Label>
                    <Textarea
                      id="product-includes"
                      value={productForm.packageIncludesInput}
                      onChange={(event) =>
                        updateProductField(
                          "packageIncludesInput",
                          event.target.value,
                        )
                      }
                      className="rounded-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Specifications</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-sm"
                        onClick={() =>
                          setSpecRows((current) => [
                            ...current,
                            { key: "", value: "" },
                          ])
                        }
                      >
                        <Plus className="size-4" />
                        Add Row
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {specRows.map((row, index) => (
                        <div key={`spec-${index}`} className="flex gap-2">
                          <Input
                            placeholder="Key"
                            value={row.key}
                            onChange={(event) =>
                              updateSpecRow(index, "key", event.target.value)
                            }
                            className="rounded-sm"
                          />
                          <Input
                            placeholder="Value"
                            value={row.value}
                            onChange={(event) =>
                              updateSpecRow(index, "value", event.target.value)
                            }
                            className="rounded-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="rounded-sm"
                            onClick={() =>
                              setSpecRows((current) =>
                                current.length > 1
                                  ? current.filter(
                                      (_, rowIndex) => rowIndex !== index,
                                    )
                                  : current,
                              )
                            }
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-video-url">Video URL</Label>
                    <Input
                      id="product-video-url"
                      value={productForm.videoUrl}
                      onChange={(event) =>
                        updateProductField("videoUrl", event.target.value)
                      }
                      className="rounded-sm"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Attachments</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-sm"
                        onClick={() =>
                          setAttachmentRows((current) => [
                            ...current,
                            { name: "", url: "" },
                          ])
                        }
                      >
                        <Plus className="size-4" />
                        Add Row
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {attachmentRows.map((row, index) => (
                        <div
                          key={`attachment-${index}`}
                          className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                        >
                          <Input
                            placeholder="Name"
                            value={row.name}
                            onChange={(event) =>
                              updateAttachmentRow(
                                index,
                                "name",
                                event.target.value,
                              )
                            }
                            className="rounded-sm"
                          />
                          <Input
                            placeholder="URL"
                            value={row.url}
                            onChange={(event) =>
                              updateAttachmentRow(
                                index,
                                "url",
                                event.target.value,
                              )
                            }
                            className="rounded-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="rounded-sm"
                            onClick={() =>
                              setAttachmentRows((current) =>
                                current.length > 1
                                  ? current.filter(
                                      (_, rowIndex) => rowIndex !== index,
                                    )
                                  : current,
                              )
                            }
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm text-white/60">
                      QnA can be added directly via database.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other-origin">Country of Origin</Label>
                    <Input
                      id="other-origin"
                      value={productForm.origin}
                      onChange={(event) =>
                        updateProductField("origin", event.target.value)
                      }
                      className="rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other-import-by">Import By</Label>
                    <Input
                      id="other-import-by"
                      value={productForm.importBy}
                      onChange={(event) =>
                        updateProductField("importBy", event.target.value)
                      }
                      className="rounded-sm"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="other-address">Address</Label>
                    <Textarea
                      id="other-address"
                      value={productForm.address}
                      onChange={(event) =>
                        updateProductField("address", event.target.value)
                      }
                      className="rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other-phone">Customer Care Phone</Label>
                    <Input
                      id="other-phone"
                      value={productForm.customerCarePhone}
                      onChange={(event) =>
                        updateProductField(
                          "customerCarePhone",
                          event.target.value,
                        )
                      }
                      className="rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other-email">Customer Care Email</Label>
                    <Input
                      id="other-email"
                      value={productForm.customerCareEmail}
                      onChange={(event) =>
                        updateProductField(
                          "customerCareEmail",
                          event.target.value,
                        )
                      }
                      className="rounded-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2 md:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-sm"
                      onClick={() => {
                        resetForm();
                        setDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-sm"
                      disabled={isPending}
                    >
                      Add Product
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-white/10 bg-card py-0">
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
                  <TableHead className="w-30">Action</TableHead>
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
        <Card className="rounded-sm border border-white/10 bg-card py-0">
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
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Delivery Status</TableHead>
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
                          handleStatusUpdate(order.id, { paymentStatus: value })
                        }
                      >
                        <SelectTrigger className="w-37.5 rounded-sm border-white/10 bg-transparent">
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
                    <TableCell className="align-top">
                      <Select
                        value={order.deliveryStatus}
                        onValueChange={(value) =>
                          handleStatusUpdate(order.id, {
                            deliveryStatus: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-47.5 rounded-sm border-white/10 bg-transparent">
                          <SelectValue placeholder="Delivery" />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_STATUSES.map((status) => (
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
              className="rounded-sm border border-white/10 bg-card py-0"
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
