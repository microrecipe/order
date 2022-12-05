import { Observable } from 'rxjs';
import { Order } from './entities/order.entity';

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

export interface IngredientId {
  id: number;
}

export interface IngredientsService {
  getIngredientById(ingredientId: IngredientId): Observable<IIngredient>;
}

export interface IOrderItem {
  id?: number;
  ingredient?: IIngredient;
  order?: Order;
  price?: number;
  quantity?: number;
}

export interface ListOrder {
  order: Order;
  orderItems?: IOrderItem[];
}

export interface CheckoutData {
  address: string;
  paymentId: number;
  courierId: number;
}

export interface ICourier {
  id?: number;
  name?: string;
  shippingCost?: number;
}

export interface CourierId {
  id: number;
}

export interface PaymentMethodId {
  id: number;
}

export interface IPaymentMethod {
  id?: number;
  name?: string;
}

export interface OrderPlacedPayload {
  orderId: number;
  cartItems: Array<IOrderItem>;
  courier: ICourier;
  paymentMethod: IPaymentMethod;
  userId: number;
  address: string;
  timestamp: Date;
}

export interface DeliveriesService {
  getCourierById(courierId: CourierId): Observable<ICourier>;
}

export interface PaymentsService {
  getPaymentMethodById(
    paymentMethodId: PaymentMethodId,
  ): Observable<IPaymentMethod>;
}
