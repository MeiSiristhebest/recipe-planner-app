import { z } from 'zod';

// Zod schema for Ingredient based on packages/types/src/index.ts
export const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string().optional(),
});

// Zod schema for Instruction based on packages/types/src/index.ts
export const InstructionSchema = z.object({
  step: z.number(),
  content: z.string(),
  image: z.string().optional(),
});

// Zod schema for NutritionInfo based on packages/types/src/index.ts
export const NutritionInfoSchema = z.object({
  calories: z.number().optional(),
  protein: z.number().optional(),
  fat: z.number().optional(),
  carbs: z.number().optional(),
});

// Zod schema for User (simplified for author context)
export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(), // Prisma's select might return null if name is optional
  image: z.string().nullable().optional(),
});

// Zod schema for Category
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

// Zod schema for Tag
export const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// Zod schema for _count field
export const RecipeCountSchema = z.object({
  comments: z.number().optional(),
  ratings: z.number().optional(),
  favorites: z.number().optional(),
});

// Main Zod schema for the data structure returned by GET /api/recipes/{id}
export const RecipeApiOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  cookingTime: z.number(),
  servings: z.number(),
  difficulty: z.enum(['简单', '中等', '困难']),
  ingredients: z.array(IngredientSchema), // Assuming API returns this structure
  instructions: z.array(InstructionSchema), // Assuming API returns this structure
  nutritionInfo: NutritionInfoSchema.nullable().optional(), // Assuming API returns this structure
  coverImage: z.string().nullable().optional(),
  createdAt: z.string().datetime().transform((str) => new Date(str)), // Transform string to Date
  updatedAt: z.string().datetime().transform((str) => new Date(str)), // Transform string to Date
  published: z.boolean(),
  authorId: z.string(),
  author: AuthorSchema.optional(), // API includes author
  categories: z.array(CategorySchema).optional(), // API includes categories
  tags: z.array(TagSchema).optional(), // API includes tags
  averageRating: z.number().optional(), // Added by API
  _count: RecipeCountSchema.optional(), // API includes _count

  // Fields specifically added by the API endpoint, not in the base Recipe model from Prisma
  isFavorited: z.boolean().optional(), // Added by API for the current user
  userRating: z.number().nullable().optional(), // Added by API for the current user
});

// Type inferred from the schema, can be used in frontend
export type ValidatedRecipeApiResponse = z.infer<typeof RecipeApiOutputSchema>;

// Example of a schema for creating/updating recipes (used by PUT /api/recipes/{id})
// This is already defined in @repo/validators, but shown here for context if needed
// export const UpsertRecipeSchema = z.object({
//   title: z.string().min(1, "标题不能为空"),
//   description: z.string().optional(),
//   cookingTime: z.number().int().positive("烹饪时间必须是正整数"),
//   servings: z.number().int().positive("份量必须是正整数"),
//   difficulty: z.enum(['简单', '中等', '困难']),
//   ingredients: z.array(IngredientSchema), // Prisma expects Json, conversion handled by API
//   instructions: z.array(InstructionSchema), // Prisma expects Json, conversion handled by API
//   nutritionInfo: NutritionInfoSchema.optional(), // Prisma expects Json
//   categoryIds: z.array(z.string()).min(1, "至少选择一个分类"),
//   tagIds: z.array(z.string()).optional(),
//   coverImage: z.string().url("必须是有效的URL").optional().or(z.literal('')),
// }); 