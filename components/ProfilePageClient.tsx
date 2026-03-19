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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

type Address = {
  id: string;
  label: string;
  fullName: string | null;
  phone: string | null;
  country: string | null;
  address: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string | null;
  pinCode: string;
  deliveryInstructions: string | null;
  isDefault: boolean;
};

type AddressForm = {
  country: string;
  fullName: string;
  phone: string;
  address: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
  deliveryInstructions: string;
};

type OrderRow = {
  id: string;
  createdAt: string;
  deliveryType: string;
  paymentStatus: string;
  deliveryStatus: string;
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

const DEFAULT_COUNTRY = "India";

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

function createEmptyAddressForm(profile: Props["initialProfile"]): AddressForm {
  return {
    country: DEFAULT_COUNTRY,
    fullName: profile?.fullName ?? "",
    phone: profile?.phone ?? "",
    address: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pinCode: "",
    isDefault: false,
    deliveryInstructions: "",
  };
}

function formatAddressLines(address: Address) {
  return [
    address.address,
    address.addressLine2,
    address.landmark ? `Landmark: ${address.landmark}` : null,
    [address.city, address.state, address.pinCode].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);
}

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
  const [addressForm, setAddressForm] = useState<AddressForm>(() =>
    createEmptyAddressForm(initialProfile),
  );
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

  function updateAddressForm<Key extends keyof AddressForm>(
    key: Key,
    value: AddressForm[Key],
  ) {
    setAddressForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openAddAddress() {
    setEditingAddressId(null);
    setAddressForm(createEmptyAddressForm(initialProfile));
    setDialogOpen(true);
  }

  function openEditAddress(address: Address) {
    setEditingAddressId(address.id);
    setAddressForm({
      country: address.country ?? DEFAULT_COUNTRY,
      fullName: address.fullName ?? initialProfile?.fullName ?? "",
      phone: address.phone ?? initialProfile?.phone ?? "",
      address: address.address,
      addressLine2: address.addressLine2 ?? "",
      landmark: address.landmark ?? "",
      city: address.city,
      state: address.state ?? "",
      pinCode: address.pinCode,
      isDefault: address.isDefault,
      deliveryInstructions: address.deliveryInstructions ?? "",
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
    setAddressForm(createEmptyAddressForm(initialProfile));

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
              <DialogContent
                className="max-h-[85vh] overflow-y-auto rounded-sm sm:max-w-2xl"
                showCloseButton
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingAddressId ? "Edit Address" : "Add Address"}
                  </DialogTitle>
                  <DialogDescription>
                    Save delivery details in checkout-ready format.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={submitAddress}>
                  <div className="space-y-2">
                    <Label htmlFor="address-country">Country/Region</Label>
                    <Select
                      value={addressForm.country}
                      onValueChange={(value) =>
                        updateAddressForm("country", value)
                      }
                    >
                      <SelectTrigger
                        id="address-country"
                        className="h-11 w-full rounded-sm"
                      >
                        <SelectValue placeholder="Choose a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-full-name">
                      Full name (First and Last name)
                    </Label>
                    <Input
                      id="address-full-name"
                      value={addressForm.fullName}
                      onChange={(event) =>
                        updateAddressForm("fullName", event.target.value)
                      }
                      className="rounded-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-phone">Mobile number</Label>
                    <Input
                      id="address-phone"
                      type="tel"
                      inputMode="tel"
                      value={addressForm.phone}
                      onChange={(event) =>
                        updateAddressForm("phone", event.target.value)
                      }
                      className="rounded-sm"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      May be used to assist delivery
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address-pin">Pincode</Label>
                      <Input
                        id="address-pin"
                        value={addressForm.pinCode}
                        onChange={(event) =>
                          updateAddressForm(
                            "pinCode",
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        className="rounded-sm"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="6 digits [0-9] PIN code"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-line-1">
                        Flat, House no., Building, Company, Apartment
                      </Label>
                      <Input
                        id="address-line-1"
                        value={addressForm.address}
                        onChange={(event) =>
                          updateAddressForm("address", event.target.value)
                        }
                        className="rounded-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-line-2">
                      Area, Street, Sector, Village
                    </Label>
                    <Input
                      id="address-line-2"
                      value={addressForm.addressLine2}
                      onChange={(event) =>
                        updateAddressForm("addressLine2", event.target.value)
                      }
                      className="rounded-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-landmark">Landmark</Label>
                    <Input
                      id="address-landmark"
                      value={addressForm.landmark}
                      onChange={(event) =>
                        updateAddressForm("landmark", event.target.value)
                      }
                      className="rounded-sm"
                      placeholder="E.g. near apollo hospital"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address-city">Town/City</Label>
                      <Input
                        id="address-city"
                        value={addressForm.city}
                        onChange={(event) =>
                          updateAddressForm("city", event.target.value)
                        }
                        className="rounded-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-state">State</Label>
                      <Select
                        value={addressForm.state}
                        onValueChange={(value) =>
                          updateAddressForm("state", value)
                        }
                      >
                        <SelectTrigger
                          id="address-state"
                          className="h-11 w-full rounded-sm"
                        >
                          <SelectValue placeholder="Choose a state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIA_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(event) =>
                        updateAddressForm("isDefault", event.target.checked)
                      }
                    />
                    <span>Make this my default address</span>
                  </label>

                  <div className="space-y-2">
                    <Label htmlFor="address-instructions">
                      Delivery instructions (optional)
                    </Label>
                    <Textarea
                      id="address-instructions"
                      value={addressForm.deliveryInstructions}
                      onChange={(event) =>
                        updateAddressForm(
                          "deliveryInstructions",
                          event.target.value,
                        )
                      }
                      className="rounded-sm"
                      placeholder="Add preferences, notes, access codes and more"
                    />
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
                    <div>
                      <p className="text-base font-medium">
                        {item.fullName || item.label}
                      </p>
                      {item.phone ? (
                        <p className="text-sm text-muted-foreground">
                          {item.phone}
                        </p>
                      ) : null}
                    </div>
                    {item.isDefault ? (
                      <Badge variant="outline">Default</Badge>
                    ) : null}
                  </div>
                  {formatAddressLines(item).map((line) => (
                    <p
                      key={`${item.id}-${line}`}
                      className="text-sm text-muted-foreground"
                    >
                      {line}
                    </p>
                  ))}
                  {item.deliveryInstructions ? (
                    <p className="text-sm text-muted-foreground">
                      Instructions: {item.deliveryInstructions}
                    </p>
                  ) : null}
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
                    <div className="flex items-center gap-3">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          Payment
                        </p>
                        <Badge variant="outline">{order.paymentStatus}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          Delivery
                        </p>
                        <Badge variant="outline">{order.deliveryStatus}</Badge>
                      </div>
                    </div>
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
