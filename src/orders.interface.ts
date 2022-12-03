import { Observable } from 'rxjs';

export interface UserType {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface INutrition {
  id?: number;
  name?: string;
  perGram?: string;
  ingredientId?: number;
}

export interface IIngredient {
  id?: number;
  name?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  nutritions?: INutrition[];
  recipeId?: number;
}

export interface IRecipe {
  id?: number;
  name?: string;
  ingredients?: IIngredient[];
}

interface RecipeId {
  id: number;
}

export interface RecipesService {
  getRecipeById(recipeId: RecipeId): Observable<IRecipe>;
}
