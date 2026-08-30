import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryDTO, ProductDTO, ProductType } from "@/lib/types";

const types: ProductType[] = ["DIGITAL", "PHYSICAL", "SERVICE"];

export function ProductForm({
  action,
  product,
  categories,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: ProductDTO;
  categories: CategoryDTO[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <Field label="Title" name="title" defaultValue={product?.title} required />
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Price (cents or Stars)"
          name="price"
          type="number"
          defaultValue={product?.price ?? 0}
          required
        />
        <Field
          label="Currency"
          name="currency"
          defaultValue={product?.currency ?? "EUR"}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={product?.type ?? "DIGITAL"}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Stock (empty = unlimited)"
          name="stock"
          defaultValue={product?.stock ?? ""}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">None</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <Field label="Image URL" name="imageUrl" defaultValue={product?.imageUrl ?? ""} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product?.active ?? true}
        />
        Active
      </label>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  );
}
