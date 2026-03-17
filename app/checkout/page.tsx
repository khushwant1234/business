"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PAYMENT_DETAILS } from "@/lib/site";
import { createClient } from "@/lib/supabase";

function formatSavedAddress(address: {
  address: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state?: string | null;
  pinCode: string;
  country?: string | null;
}) {
  return [
    address.address,
    address.addressLine2,
    address.landmark ? `Landmark: ${address.landmark}` : null,
    [address.city, address.state, address.pinCode].filter(Boolean).join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState("NORMAL");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [autofilled, setAutofilled] = useState(false);
  const [supabase] = useState(createClient);

  useEffect(() => {
    async function applyAutofill() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const response = await fetch("/api/profile", { method: "GET" });

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const defaultAddress = (payload.profile?.addresses ?? []).find(
        (item: {
          isDefault: boolean;
          fullName?: string | null;
          phone?: string | null;
          country?: string | null;
          address: string;
          addressLine2?: string | null;
          landmark?: string | null;
          city: string;
          state?: string | null;
          pinCode: string;
        }) => item.isDefault,
      );

      if (!defaultAddress) {
        return;
      }

      setCustomerName(
        defaultAddress.fullName ?? payload.profile?.fullName ?? "",
      );
      setPhone(defaultAddress.phone ?? payload.profile?.phone ?? "");
      setAddress(formatSavedAddress(defaultAddress));
      setAutofilled(true);
    }

    applyAutofill();
  }, [supabase.auth]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        phone,
        address,
        deliveryType,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Failed to place order.");
      return;
    }

    clearCart();
    router.push("/products");
    router.refresh();
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-[minmax(0,1fr)_360px] md:px-6 md:py-16">
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Checkout
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Shipping and payment
          </h1>
        </div>

        <Card className="rounded-sm border border-border py-0">
          <CardContent className="p-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="checkout-name">Name</Label>
                <Input
                  id="checkout-name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="rounded-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-phone">Phone</Label>
                <Input
                  id="checkout-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="rounded-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout-address">Address</Label>
                <Input
                  id="checkout-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="rounded-sm"
                  required
                />
                {autofilled ? (
                  <p className="text-xs text-muted-foreground">
                    Autofilled from your saved default address. You can edit
                    this.
                  </p>
                ) : null}
              </div>
              <div className="space-y-3">
                <Label>Delivery type</Label>
                <RadioGroup
                  value={deliveryType}
                  onValueChange={setDeliveryType}
                >
                  <label className="flex items-center gap-3 rounded-sm border border-border px-3 py-3 text-sm text-muted-foreground">
                    <RadioGroupItem value="EXPRESS" />
                    Express delivery
                  </label>
                  <label className="flex items-center gap-3 rounded-sm border border-border px-3 py-3 text-sm text-muted-foreground">
                    <RadioGroupItem value="NORMAL" />
                    Normal delivery
                  </label>
                </RadioGroup>
              </div>
              {error ? (
                <p className="text-sm text-muted-foreground">{error}</p>
              ) : null}
              <Button
                type="submit"
                className="rounded-sm"
                disabled={submitting || !items.length}
              >
                Place Order
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="rounded-sm border border-border py-0">
          <CardHeader className="border-b border-border py-4">
            <CardTitle>Payment instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground">Account Name:</span>{" "}
              {PAYMENT_DETAILS.accountName}
            </p>
            <p>
              <span className="text-foreground">Bank:</span>{" "}
              {PAYMENT_DETAILS.bankName}
            </p>
            <p>
              <span className="text-foreground">Account Number:</span>{" "}
              {PAYMENT_DETAILS.accountNumber}
            </p>
            <p>{PAYMENT_DETAILS.note}</p>
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-border py-0">
          <CardHeader className="border-b border-border py-4">
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Products</span>
              <span>{items.length}</span>
            </div>
            <div className="flex items-center justify-between text-base text-foreground">
              <span>Total</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
