"use client";

import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_CATEGORIES } from "@/lib/site";

const requestSchema = z.object({
  productName: z.string().min(2, "Product name is required."),
  category: z.string().min(1, "Category is required."),
  description: z.string().min(10, "Description is too short."),
  reason: z.string().min(10, "Reason is too short."),
  contact: z.string().min(5, "Contact information is required."),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export default function RequestPage() {
  const form = useForm<RequestFormValues>({
    defaultValues: {
      productName: "",
      category: "Motors",
      description: "",
      reason: "",
      contact: "",
    },
  });

  async function onSubmit(values: RequestFormValues) {
    form.clearErrors("root");

    const parsed = requestSchema.safeParse(values);

    if (!parsed.success) {
      form.setError("root", {
        type: "validation",
        message: "Please review the form fields and try again.",
      });
      return;
    }

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const payload = await response.json();

    if (!response.ok) {
      form.setError("root", {
        type: "server",
        message: payload.error ?? "Failed to submit request.",
      });
      return;
    }

    form.reset();
    form.setError("root", {
      type: "success",
      message: "Request submitted.",
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">
          Request Listing
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Request a part
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-white/65">
          Submit sourcing requirements for parts that are not currently listed
          in the catalog.
        </p>
      </div>

      <Card className="rounded-sm border border-white/10 bg-card py-0">
        <CardHeader className="border-b border-white/10 py-4">
          <CardTitle>Requirement form</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-sm border-white/10 bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full rounded-sm border-white/10 bg-transparent">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="rounded-sm border-white/10 bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why you need it</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="rounded-sm border-white/10 bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact info</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-sm border-white/10 bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root?.message ? (
                <p className="text-sm text-white/70">
                  {form.formState.errors.root.message}
                </p>
              ) : null}
              <Button
                type="submit"
                className="rounded-sm"
                disabled={form.formState.isSubmitting}
              >
                Submit Request
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
