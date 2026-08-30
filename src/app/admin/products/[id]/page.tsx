import { notFound, redirect } from "next/navigation";
import {
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  const update = updateProductAction.bind(null, product.id);
  const remove = deleteProductAction.bind(null, product.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit product</h1>
      <ProductForm
        action={update}
        product={product}
        categories={categories}
        submitLabel="Save changes"
      />
      <form action={remove}>
        <Button type="submit" variant="destructive">
          Delete product
        </Button>
      </form>
    </div>
  );
}
