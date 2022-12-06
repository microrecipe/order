export enum ClientPackageNames {
  recipeGRPC = 'RECIPE_GRPC_SERVICE',
  recipeTCP = 'RECIPE_TCP_SERVICE',
  ingredientGRPC = 'INGREDIENT_GRPC_SERVICE',
  ingredientTCP = 'INGREDIENT_TCP_SERVICE',
  deliveryGRPC = 'DELIVERY_GRPC_SERVICE',
  paymentGRPC = 'PAYMENT_GRPC_SERVICE',
  orderPlacedTopic = 'ORDER_PLACED_TOPIC',
  paymentPaidTopic = 'PAYMENT_PAID_TOPIC',
}

export enum TopicNames {
  orderPlaced = 'order.placed',
  paymentPaid = 'payment.paid',
  deliveryOrdered = 'delivery.ordered',
  deliveryRouted = 'delivery.routed',
  deliveryFinished = 'delivery.finished',
}
