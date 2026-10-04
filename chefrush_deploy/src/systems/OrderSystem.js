/**
 * OrderSystem - Centralized Order Lifecycle Management
 * Supports both single-item orders and multi-item combo orders.
 */
import { globalEventBus } from '../core/EventBus.js';
import { getRecipe } from '../data/RecipesData.js';

export const ORDER_STATUS = {
    WAITING: 'WAITING',
    SERVED: 'SERVED',
    FAILED: 'FAILED'
};

export class Order {
    constructor(orderId, customerId, recipeIds, basePatience) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.recipeIds = Array.isArray(recipeIds) ? recipeIds : [recipeIds];
        this.recipeId = this.recipeIds[0]; // Primary recipe for backward compatibility
        this.recipe = getRecipe(this.recipeId);
        
        // Structured order items
        this.items = this.recipeIds.map((rId, idx) => ({
            id: idx,
            recipeId: rId,
            recipe: getRecipe(rId),
            fulfilled: false
        }));

        this.status = ORDER_STATUS.WAITING;
        this.basePatience = basePatience;
        this.remainingPatience = basePatience;
        this.createdAt = performance.now();
        this.accumulatedBaseCoins = 0;
        this.accumulatedTipCoins = 0;
        this.accumulatedScore = 0;
    }

    /**
     * Check if all items in this order are fulfilled
     * @returns {boolean}
     */
    isAllFulfilled() {
        return this.items.every(item => item.fulfilled);
    }

    /**
     * Get list of unfulfilled items
     * @returns {Object[]}
     */
    getPendingItems() {
        return this.items.filter(item => !item.fulfilled);
    }
}

export class OrderSystem {
    constructor(eventBus = globalEventBus) {
        this.eventBus = eventBus;
        this.orders = new Map();
        this.nextOrderId = 1;
    }

    /**
     * Clear all orders
     */
    reset() {
        this.orders.clear();
        this.nextOrderId = 1;
    }

    /**
     * Create an order for a customer (single or multiple items)
     * @param {string} customerId 
     * @param {string|string[]} recipeIds 
     * @param {number} patienceDuration 
     * @returns {Order|null}
     */
    createOrder(customerId, recipeIds, patienceDuration) {
        const orderId = `ORD_${this.nextOrderId++}`;
        const order = new Order(orderId, customerId, recipeIds, patienceDuration);
        this.orders.set(orderId, order);

        this.eventBus.emit('ORDER_CREATED', { order });
        return order;
    }

    /**
     * Get order by ID
     * @param {string} orderId 
     * @returns {Order|null}
     */
    getOrder(orderId) {
        return this.orders.get(orderId) || null;
    }

    /**
     * Get order belonging to a specific customer
     * @param {string} customerId 
     * @returns {Order|null}
     */
    getOrderByCustomerId(customerId) {
        for (const order of this.orders.values()) {
            if (order.customerId === customerId && order.status === ORDER_STATUS.WAITING) {
                return order;
            }
        }
        return null;
    }

    /**
     * Get all active waiting orders
     * @returns {Order[]}
     */
    getActiveOrders() {
        return Array.from(this.orders.values()).filter(o => o.status === ORDER_STATUS.WAITING);
    }

    /**
     * Find best matching waiting order that needs a specific recipe
     * Prioritizes the customer with lowest remaining patience
     * @param {string} recipeId 
     * @returns {Order|null}
     */
    findMatchingOrder(recipeId) {
        const matches = this.getActiveOrders().filter(o => {
            return o.items.some(item => !item.fulfilled && item.recipeId === recipeId);
        });

        if (matches.length === 0) return null;

        matches.sort((a, b) => a.remainingPatience - b.remainingPatience);
        return matches[0];
    }

    /**
     * Fulfill a matching dish for an order
     * @param {string} orderId 
     * @param {string} [recipeId] Recipe of the dish being delivered
     * @returns {Object|null}
     */
    fulfillOrderItem(orderId, recipeId) {
        const order = this.getOrder(orderId);
        if (!order || order.status !== ORDER_STATUS.WAITING) return null;

        // Find the matching unfulfilled item in this order
        let targetItem = null;
        if (recipeId) {
            targetItem = order.items.find(item => !item.fulfilled && item.recipeId === recipeId);
        }
        if (!targetItem) {
            targetItem = order.items.find(item => !item.fulfilled);
        }
        if (!targetItem) return null;

        targetItem.fulfilled = true;

        const patienceRatio = Math.max(0, order.remainingPatience / order.basePatience);
        const isPerfect = patienceRatio >= 0.7;
        const tipEarned = Math.round((targetItem.recipe?.tipMax || 5) * patienceRatio);
        const baseEarned = targetItem.recipe?.basePrice || 20;
        const scoreEarned = (targetItem.recipe?.scoreReward || 100) + (isPerfect ? 50 : 0);

        order.accumulatedBaseCoins = (order.accumulatedBaseCoins || 0) + baseEarned;
        order.accumulatedTipCoins = (order.accumulatedTipCoins || 0) + tipEarned;
        order.accumulatedScore = (order.accumulatedScore || 0) + scoreEarned;

        const isComplete = order.isAllFulfilled();
        if (isComplete) {
            order.status = ORDER_STATUS.SERVED;
        }

        const result = {
            order,
            item: targetItem,
            baseEarned,
            tipEarned,
            scoreEarned,
            totalBaseCoins: order.accumulatedBaseCoins,
            totalTipCoins: order.accumulatedTipCoins,
            totalScore: order.accumulatedScore,
            isPerfect,
            isComplete,
            remainingItemsCount: order.getPendingItems().length
        };

        this.eventBus.emit('ORDER_ITEM_FULFILLED', result);

        if (isComplete) {
            this.eventBus.emit('ORDER_FULFILLED', result);
        }

        return result;
    }

    /**
     * Backward compatible wrapper for fulfillOrder
     * @param {string} orderId 
     * @returns {Object|null}
     */
    fulfillOrder(orderId) {
        return this.fulfillOrderItem(orderId);
    }

    /**
     * Cancel / fail an order when customer leaves angry
     * @param {string} customerId 
     */
    failOrderByCustomerId(customerId) {
        const order = this.getOrderByCustomerId(customerId);
        if (order) {
            order.status = ORDER_STATUS.FAILED;
            this.eventBus.emit('ORDER_FAILED', { order });
        }
    }

    /**
     * Update order patience timers
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        if (dt <= 0) return;

        for (const order of this.orders.values()) {
            if (order.status === ORDER_STATUS.WAITING) {
                order.remainingPatience -= dt;
                if (order.remainingPatience <= 0) {
                    order.status = ORDER_STATUS.FAILED;
                    this.eventBus.emit('ORDER_EXPIRED', { order });
                }
            }
        }
    }
}
