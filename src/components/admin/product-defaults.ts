import type { ProductFormValues } from "./ProductForm";

export function emptyProduct(): ProductFormValues {
  return {
    title: "", slug: "", description: "", categoryId: "", gender: "UNISEX", price: "", compareAtPrice: "", images: [],
    fabric: "", fit: "", careInstructions: "", tags: "", status: "ACTIVE",
    isFeatured: false, isNewArrival: true, isBestSeller: false, isTrending: false, isFlashSale: false,
    seoTitle: "", seoDescription: "", variants: [],
  };
}
