/**
 * CustomerSystem - Customer State Machine and Queue Management
 * Manages seats at the counter, arrival pacing, patience decay, multi-item orders, and dine-and-dash thieves.
 */
import { globalEventBus } from '../core/EventBus.js';
import { getRandomCustomerArchetype } from '../data/CustomersData.js';

export const CUSTOMER_STATES = {
    IDLE: 'IDLE',
    ENTERING: 'ENTERING',
    WAITING_FOOD: 'WAITING_FOOD',
    HAPPY_LEAVING: 'HAPPY_LEAVING',
    ANGRY_LEAVING: 'ANGRY_LEAVING',
    THIEF_LEAVING: 'THIEF_LEAVING'
};

export class CustomerInstance {
    constructor(id, seatIndex, archetype, patienceDuration, orderRecipes, isThief = false) {
        this.id = id;
        this.seatIndex = seatIndex;
        this.archetype = archetype;
        this.orderRecipes = Array.isArray(orderRecipes) ? orderRecipes : [orderRecipes];
        this.orderRecipeId = this.orderRecipes[0]; // backward compatibility
        this.state = CUSTOMER_STATES.ENTERING;
        this.totalPatience = patienceDuration;
        this.remainingPatience = patienceDuration;
        this.patienceRatio = 1.0;
        this.leaveTimer = 0;
        this.isThief = isThief;
        this.thiefTimer = 3.6; // 3.6s to tap and catch fleeing thief
        this.pendingRecipes = [...this.orderRecipes];
        this.deliveredRecipes = [];
        this.stolenEarnings = null;
    }
}

export class CustomerSystem {
    constructor(eventBus = globalEventBus) {
        this.eventBus = eventBus;
        this.maxSeats = 3;
        this.activeCustomers = new Map(); // seatIndex -> CustomerInstance
        this.nextCustomerId = 1;
        this.patienceMultiplier = 1.0;
    }

    /**
     * Configure customer seats and patience multipliers
     * @param {Object} options 
     */
    configure({ maxSeats = 3, patienceMultiplier = 1.0 } = {}) {
        this.maxSeats = Math.max(1, Math.min(4, maxSeats));
        this.patienceMultiplier = Math.max(0.1, patienceMultiplier);
        this.reset();
    }

    /**
     * Clear all customers
     */
    reset() {
        this.activeCustomers.clear();
        this.nextCustomerId = 1;
        this.tutorialSpawnIndex = 0;
    }

    /**
     * Find first available counter seat
     * @returns {number} Seat index or -1 if counter is full
     */
    getAvailableSeat() {
        for (let i = 0; i < this.maxSeats; i++) {
            if (!this.activeCustomers.has(i)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Check if a customer can spawn right now
     * @returns {boolean}
     */
    canSpawnCustomer() {
        return this.getAvailableSeat() !== -1;
    }

    /**
     * Spawn a new customer at the counter
     * @param {string[]} availableRecipes 
     * @param {Object} [levelConfig]
     * @returns {CustomerInstance|null}
     */
    spawnCustomer(availableRecipes, levelConfig = {}) {
        if (!this.canSpawnCustomer() || !availableRecipes || availableRecipes.length === 0) {
            return null;
        }

        const seatIndex = this.getAvailableSeat();
        const customerId = `CUST_${this.nextCustomerId++}`;
        const archetype = getRandomCustomerArchetype();

        // Determine if customer orders 1 dish or 2 dishes (Combo Order)
        let orderRecipes = [];
        if (levelConfig.isTutorial && levelConfig.tutorialRecipeSequence && levelConfig.tutorialRecipeSequence.length > 0) {
            // Sequence each dish one-by-one for tutorial mode
            const seq = levelConfig.tutorialRecipeSequence;
            const targetDish = seq[Math.min(this.tutorialSpawnIndex || 0, seq.length - 1)];
            this.tutorialSpawnIndex = (this.tutorialSpawnIndex || 0) + 1;
            orderRecipes = [targetDish];
        } else if (levelConfig.hasMultiOrder && availableRecipes.length >= 2 && Math.random() < (levelConfig.multiOrderChance || 0.45)) {
            // Pick a primary burger/main, plus a side/drink
            const first = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            let remaining = availableRecipes.filter(r => r !== first);
            if (remaining.length === 0) remaining = availableRecipes;
            const second = remaining[Math.floor(Math.random() * remaining.length)];
            orderRecipes = [first, second];
        } else {
            orderRecipes = [availableRecipes[Math.floor(Math.random() * availableRecipes.length)]];
        }

        // Determine if customer is a sneak thief (Dine-and-dash) - Disabled per requirement 1
        const isThief = false;

        // Đặt cố định thời gian chờ (hiển thị order) là 60 giây
        const totalPatience = 60;
        const customer = new CustomerInstance(customerId, seatIndex, archetype, totalPatience, orderRecipes, isThief);
        this.activeCustomers.set(seatIndex, customer);

        this.eventBus.emit('CUSTOMER_ARRIVED', { customer });

        customer.state = CUSTOMER_STATES.WAITING_FOOD;
        return customer;
    }

    /**
     * Get active customer by seat index
     * @param {number} seatIndex 
     * @returns {CustomerInstance|null}
     */
    getCustomerBySeat(seatIndex) {
        return this.activeCustomers.get(seatIndex) || null;
    }

    /**
     * Get active customer by customer ID
     * @param {string} customerId 
     * @returns {CustomerInstance|null}
     */
    getCustomerById(customerId) {
        for (const cust of this.activeCustomers.values()) {
            if (cust.id === customerId) return cust;
        }
        return null;
    }

    /**
     * Mark an item delivered for a customer
     * @param {string} customerId 
     * @param {string} recipeId 
     */
    deliverItemToCustomer(customerId, recipeId) {
        const customer = this.getCustomerById(customerId);
        if (!customer) return;

        const idx = customer.pendingRecipes.indexOf(recipeId);
        if (idx !== -1) {
            customer.pendingRecipes.splice(idx, 1);
            customer.deliveredRecipes.push(recipeId);
        }

        this.eventBus.emit('CUSTOMER_ITEM_DELIVERED', {
            customer,
            deliveredRecipe: recipeId,
            remainingCount: customer.pendingRecipes.length
        });
    }

    /**
     * Mark customer fully served
     * @param {string} customerId 
     * @param {Object} [earnings]
     * @returns {CustomerInstance|null}
     */
    serveCustomer(customerId, earnings = null) {
        const customer = this.getCustomerById(customerId);
        if (!customer || customer.state !== CUSTOMER_STATES.WAITING_FOOD) return null;

        customer.state = CUSTOMER_STATES.HAPPY_LEAVING;
        customer.leaveTimer = 1.0;

        this.eventBus.emit('CUSTOMER_SERVED_HAPPY', { customer });
        return customer;
    }

    /**
     * Player taps fleeing thief to catch them and reclaim money
     * @param {string} customerId 
     * @returns {Object|null}
     */
    catchThief(customerId) {
        const customer = this.getCustomerById(customerId);
        if (!customer || customer.state !== CUSTOMER_STATES.THIEF_LEAVING) return null;

        const recoveredEarnings = customer.stolenEarnings;
        customer.state = CUSTOMER_STATES.HAPPY_LEAVING;
        customer.leaveTimer = 0.6;

        this.eventBus.emit('CUSTOMER_THIEF_CAUGHT', {
            customer,
            recoveredEarnings
        });

        return { success: true, customer, recoveredEarnings };
    }

    /**
     * Update customer patience and handle departures
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        if (dt <= 0) return;

        for (const [seatIndex, customer] of Array.from(this.activeCustomers.entries())) {
            if (customer.state === CUSTOMER_STATES.WAITING_FOOD) {
                const decayRate = customer.archetype.patienceRate || 1.0;
                customer.remainingPatience -= dt * decayRate;
                customer.patienceRatio = Math.max(0, customer.remainingPatience / customer.totalPatience);

                this.eventBus.emit('CUSTOMER_PATIENCE_UPDATED', {
                    customerId: customer.id,
                    seatIndex: customer.seatIndex,
                    patienceRatio: customer.patienceRatio,
                    isUrgent: customer.patienceRatio <= 0.3
                });

                if (customer.remainingPatience <= 0) {
                    customer.state = CUSTOMER_STATES.ANGRY_LEAVING;
                    customer.leaveTimer = 1.2;

                    this.eventBus.emit('CUSTOMER_ANGRY_LEAVING', { customer });
                }
            } else if (customer.state === CUSTOMER_STATES.THIEF_LEAVING) {
                customer.leaveTimer -= dt;
                this.eventBus.emit('CUSTOMER_THIEF_TICK', {
                    customerId: customer.id,
                    seatIndex: customer.seatIndex,
                    timeRemaining: customer.leaveTimer,
                    progressRatio: Math.max(0, customer.leaveTimer / customer.thiefTimer)
                });

                if (customer.leaveTimer <= 0) {
                    const lostEarnings = customer.stolenEarnings;
                    this.activeCustomers.delete(seatIndex);

                    this.eventBus.emit('CUSTOMER_THIEF_ESCAPED', {
                        customer,
                        lostEarnings
                    });
                    this.eventBus.emit('CUSTOMER_DEPARTED', { customerId: customer.id, seatIndex });
                }
            } else if (customer.state === CUSTOMER_STATES.HAPPY_LEAVING || customer.state === CUSTOMER_STATES.ANGRY_LEAVING) {
                customer.leaveTimer -= dt;
                if (customer.leaveTimer <= 0) {
                    this.activeCustomers.delete(seatIndex);
                    this.eventBus.emit('CUSTOMER_DEPARTED', { customerId: customer.id, seatIndex });
                }
            }
        }
    }
}
