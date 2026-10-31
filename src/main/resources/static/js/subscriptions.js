const SUBSCRIPTION_API = "/api/subscriptions";
const CUSTOMER_API = "/api/customers";
const PRODUCT_API = "/api/products";
const PLAN_API = "/api/plans";

let subscriptions = [];

// Escape user-provided values to prevent XSS
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Fetch and load all subscriptions
async function loadSubscriptions() {
    const tableBody = document.getElementById("subscriptionTableBody");

    try {
        const response = await fetch(SUBSCRIPTION_API);

        if (!response.ok) {
            throw new Error("Failed to load subscriptions");
        }

        subscriptions = await response.json();
        displaySubscriptions(subscriptions);

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message" style="text-align: center; padding: 20px;">
                    Unable to load subscriptions.
                </td>
            </tr>
        `;
    }
}

// Render subscriptions in the table
function displaySubscriptions(data) {
    const tableBody = document.getElementById("subscriptionTableBody");

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message" style="text-align: center; padding: 20px;">
                    No subscriptions found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(sub => {
        const status = sub.status || "UNKNOWN";
        const statusClass = status === "ACTIVE" ? "status-active" : "status-cancelled";

        return `
            <tr>
                <td>#${sub.id}</td>
                <td>${escapeHTML(sub.customer?.name || "N/A")}</td>
                <td>${escapeHTML(sub.product?.name || "N/A")}</td>
                <td>${escapeHTML(sub.plan?.planName || "N/A")}</td>
                <td>${sub.startDate || "N/A"}</td>
                <td>${sub.endDate || "N/A"}</td>
                <td>
                    <span class="status ${statusClass}">
                        ${status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons" style="display: flex; gap: 5px;">
                        ${status === "ACTIVE" ? `
                            <button class="edit-button" onclick="cancelSubscription(${sub.id})" style="background: #fff0ed; color: #dc735f; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">
                                Cancel
                            </button>
                        ` : ""}
                        <button class="delete-button" onclick="deleteSubscription(${sub.id})" style="background: #fee; color: #c00; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// Load dropdown options for Customers, Products, and Plans when opening the modal
async function loadDropdownOptions() {
    try {
        const [customersRes, productsRes, plansRes] = await Promise.all([
            fetch(CUSTOMER_API),
            fetch(PRODUCT_API),
            fetch(PLAN_API)
        ]);

        const customers = await customersRes.json();
        const products = await productsRes.json();
        const plans = await plansRes.json();

        // Populate Customers dropdown
        const customerSelect = document.getElementById("customerId");
        customerSelect.innerHTML = '<option value="">Select Customer</option>' +
            customers.map(c => `<option value="${c.id}">${escapeHTML(c.name)} (${escapeHTML(c.email)})</option>`).join("");

        // Populate Products dropdown
        const productSelect = document.getElementById("productId");
        productSelect.innerHTML = '<option value="">Select Product</option>' +
            products.map(p => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("");

        // Populate Plans dropdown (only active plans recommended)
        const planSelect = document.getElementById("planId");
        planSelect.innerHTML = '<option value="">Select Plan</option>' +
            plans.filter(pl => pl.active).map(pl => `<option value="${pl.id}">${escapeHTML(pl.planName)} - ₹${pl.price} (${pl.billingCycle})</option>`).join("");

    } catch (error) {
        console.error("Failed to load form dropdown options:", error);
    }
}

// Search / Filter subscriptions
function searchSubscriptions() {
    const query = document.getElementById("searchSubscription").value.toLowerCase();

    const filtered = subscriptions.filter(sub =>
        [
            sub.customer?.name,
            sub.product?.name,
            sub.plan?.planName,
            sub.status
        ].some(val => String(val || "").toLowerCase().includes(query))
    );

    displaySubscriptions(filtered);
}

// Open modal and load dropdown values
async function openSubscriptionForm() {
    document.getElementById("subscriptionForm").reset();
    
    // Set default start date to today's date format YYYY-MM-DD
    document.getElementById("startDate").value = new Date().toISOString().split("T")[0];

    await loadDropdownOptions();
    document.getElementById("subscriptionModal").style.display = "block";
}

// Close modal
function closeSubscriptionForm() {
    document.getElementById("subscriptionModal").style.display = "none";
}

// Handle form submission to create subscription
document.getElementById("subscriptionForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const requestPayload = {
        customerId: Number(document.getElementById("customerId").value),
        productId: Number(document.getElementById("productId").value),
        planId: Number(document.getElementById("planId").value),
        startDate: document.getElementById("startDate").value || null
    };

    if (!requestPayload.customerId || !requestPayload.productId || !requestPayload.planId) {
        alert("Please select a customer, product, and plan.");
        return;
    }

    try {
        const response = await fetch(SUBSCRIPTION_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to create subscription");
        }

        closeSubscriptionForm();
        await loadSubscriptions();
        alert("Subscription created successfully!");

    } catch (error) {
        alert(error.message);
    }
});

// Cancel subscription endpoint call
async function cancelSubscription(id) {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;

    try {
        const response = await fetch(`${SUBSCRIPTION_API}/${id}/cancel`, {
            method: "PUT"
        });

        if (!response.ok) {
            throw new Error("Failed to cancel subscription");
        }

        await loadSubscriptions();
        alert("Subscription cancelled successfully.");
    } catch (error) {
        alert(error.message);
    }
}

// Delete subscription endpoint call
async function deleteSubscription(id) {
    if (!confirm("Are you sure you want to delete this subscription record?")) return;

    try {
        const response = await fetch(`${SUBSCRIPTION_API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete subscription");
        }

        await loadSubscriptions();
        alert("Subscription deleted successfully.");
    } catch (error) {
        alert(error.message);
    }
}

// Initial load on page startup
loadSubscriptions();