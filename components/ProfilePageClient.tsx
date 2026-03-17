"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

type Address = {
  id: string;
  label: string;
  address: string;
  city: string;
  pinCode: string;
  isDefault: boolean;
};

type OrderRow = {
  id: string;
  createdAt: string;
  deliveryType: string;
  paymentStatus: string;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      name: string;
    };
  }>;
};

type Props = {
  email: string;
  initialProfile: {
    fullName: string | null;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
  initialAddresses: Address[];
  orders: OrderRow[];
};

const EMPTY_ADDRESS = {
  label: "",
  address: "",
  city: "",
  pinCode: "",
};

export default function ProfilePageClient({
  email,
  initialProfile,
  initialAddresses,
  orders,
}: Props) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(initialProfile?.fullName ?? "");
  const [phone, setPhone] = useState(initialProfile?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);

  const firstName = (fullName.trim().split(" ")[0] || "there").trim();
  const initials = useMemo(() => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (!parts.length) {
      return email.slice(0, 2).toUpperCase();
    }
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [email, fullName]);

  async function saveProfile() {
    setSavingProfile(true);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        phone,
        avatarUrl,
      }),
    });

    setSavingProfile(false);

    if (!response.ok) {
      toast({
        title: "Failed",
        description: "Could not save profile changes.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Saved",
      description: "Profile updated successfully.",
    });
  }

  function openAddAddress() {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS);
    setDialogOpen(true);
  }

  function openEditAddress(address: Address) {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      address: address.address,
      city: address.city,
      pinCode: address.pinCode,
    });
    setDialogOpen(true);
  }

  async function submitAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAddress(true);

    const url = editingAddressId
      ? `/api/addresses/${editingAddressId}`
      : "/api/addresses";
    const method = editingAddressId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });

    const payload = await response.json();
    setSavingAddress(false);

    if (!response.ok) {
      toast({
        title: "Failed",
        description: payload.error ?? "Unable to save address.",
        variant: "destructive",
      });
      return;
    }

    if (editingAddressId) {
      setAddresses((current) =>
        current.map((item) => (item.id === payload.id ? payload : item)),
      );
    } else {
      setAddresses((current) => [payload, ...current]);
    }

    setDialogOpen(false);
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS);

    toast({
      title: "Saved",
      description: "Address saved successfully.",
    });
  }

  async function deleteAddress(id: string) {
    const response = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      toast({
        title: "Failed",
        description: payload.error ?? "Unable to delete address.",
        variant: "destructive",
      });
      return;
    }

    setAddresses((current) => current.filter((item) => item.id !== id));
    toast({ title: "Deleted", description: "Address removed." });
  }

  async function makeDefault(id: string) {
    const response = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast({
        title: "Failed",
        description: payload.error ?? "Unable to set default address.",
        variant: "destructive",
      });
      return;
    }

    setAddresses((current) =>
      current.map((item) => ({ ...item, isDefault: item.id === payload.id })),
    );
    toast({ title: "Updated", description: "Default address updated." });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList
          variant="line"
          className="h-auto w-full flex-col items-stretch gap-2 border-b border-border p-0 pb-3 sm:flex-row sm:items-center"
        >
          <TabsTrigger
            value="personal"
            className="rounded-sm border border-border px-3 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background"
          >
            Personal Info
          </TabsTrigger>
          <TabsTrigger
            value="addresses"
            className="rounded-sm border border-border px-3 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background"
          >
            Delivery Addresses
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="rounded-sm border border-border px-3 py-2 data-[state=active]:bg-foreground data-[state=active]:text-background"
          >
            My Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="rounded-sm border border-border py-0">
            <CardHeader className="border-b border-border py-4">
              <CardTitle>Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarImage
                    src={avatarUrl || undefined}
                    alt="Profile picture"
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">Profile preview</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-full-name">Full Name</Label>
                  <Input
                    id="profile-full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Phone Number</Label>
                  <Input
                    id="profile-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-avatar">Profile Picture URL</Label>
                  <Input
                    id="profile-avatar"
                    type="url"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-email">
                    Email (cannot be changed)
                  </Label>
                  <Input
                    id="profile-email"
                    value={email}
                    readOnly
                    className="rounded-sm"
                  />
                </div>
              </div>

              <Button
                type="button"
                className="rounded-sm"
                disabled={savingProfile}
                onClick={saveProfile}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-medium">Saved Addresses</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className="rounded-sm"
                  onClick={openAddAddress}
                >
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-sm" showCloseButton>
                <DialogHeader>
                  <DialogTitle>
                    {editingAddressId ? "Edit Address" : "Add Address"}
                  </DialogTitle>
                  <DialogDescription>
                    Save delivery details for faster checkout.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={submitAddress}>
                  <div className="space-y-2">
                    <Label htmlFor="address-label">Label</Label>
                    <Input
                      id="address-label"
                      value={addressForm.label}
                      onChange={(event) =>
                        setAddressForm((current) => ({
                          ...current,
                          label: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address-full">Full Address</Label>
                    <Input
                      id="address-full"
                      value={addressForm.address}
                      onChange={(event) =>
                        setAddressForm((current) => ({
                          ...current,
                          address: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address-city">City</Label>
                      <Input
                        id="address-city"
                        value={addressForm.city}
                        onChange={(event) =>
                          setAddressForm((current) => ({
                            ...current,
                            city: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-pin">PIN Code</Label>
                      <Input
                        id="address-pin"
                        value={addressForm.pinCode}
                        onChange={(event) =>
                          setAddressForm((current) => ({
                            ...current,
                            pinCode: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="p-0">
                    <Button
                      type="submit"
                      className="rounded-sm"
                      disabled={savingAddress}
                    >
                      {savingAddress ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {addresses.map((item) => (
              <Card
                key={item.id}
                className="rounded-sm border border-border py-0"
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-base font-medium">{item.label}</p>
                    {item.isDefault ? (
                      <Badge variant="outline">Default</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.city}, {item.pinCode}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-sm"
                      onClick={() => openEditAddress(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-sm"
                      onClick={() => deleteAddress(item.id)}
                    >
                      Delete
                    </Button>
                    {!item.isDefault ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-sm"
                        onClick={() => makeDefault(item.id)}
                      >
                        Set as Default
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!addresses.length ? (
              <p className="py-6 text-sm text-muted-foreground">
                No saved addresses yet.
              </p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {orders.length ? (
            orders.map((order) => (
              <Card
                key={order.id}
                className="rounded-sm border border-border py-0"
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      Order {order.id.slice(0, 8)}...
                    </p>
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Date placed: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Items:{" "}
                    {order.items
                      .map((item) => `${item.product.name} x${item.quantity}`)
                      .join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Delivery type: {order.deliveryType}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-sm border border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No orders yet. Browse our parts →
              </p>
              <Link
                href="/products"
                className="text-sm font-medium hover:opacity-80"
              >
                Browse parts
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
