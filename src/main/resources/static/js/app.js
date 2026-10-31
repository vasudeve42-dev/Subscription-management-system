const API_BASE = "http://localhost:8080/api";

// Format currency in Indian Rupees
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount || 0);
}

// Display current date
document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

// Load dashboard statistics
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/summary`);

        if (!response.ok) {
            throw new Error("Could not load dashboard statistics");
        }

        const data = await response.json();

        document.getElementById("totalRevenue").textContent =
            formatCurrency(data.totalRevenue);

        document.getElementById("totalCustomers").textContent =
            data.totalCustomers;

        document.getElementById("activeSubscriptions").textContent =
            data.activeSubscriptions;

        document.getElementById("outstandingAmount").textContent =
            formatCurrency(data.outstandingAmount);

        document.getElementById("totalProducts").textContent =
            data.totalProducts;

        document.getElementById("totalInvoices").textContent =
            data.totalInvoices;

        document.getElementById("overdueInvoices").textContent =
            data.overdueInvoices;

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// Load recent subscriptions
async function loadSubscriptions() {
    const table = document.getElementById("subscriptionTable");

    try {
        const response = await fetch(`${API_BASE}/subscriptions`);

        if (!response.ok) {
            throw new Error("Could not load subscriptions");
        }

        const subscriptions = await response.json();

        if (subscriptions.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-message">
                        No subscriptions found.
                    </td>
                </tr>
            `;
            return;
        }

        // Show latest five subscriptions
        const recentSubscriptions = subscriptions.slice(-5).reverse();

        table.innerHTML = recentSubscriptions.map(subscription => {

            const status = subscription.status || "UNKNOWN";

            const statusClass =
                status === "ACTIVE"
                    ? "status-active"
                    : "status-cancelled";

            return `
                <tr>
                    <td>#${subscription.id}</td>
                    <td>${subscription.customer?.name || "N/A"}</td>
                    <td>${subscription.product?.name || "N/A"}</td>
                    <td>${subscription.plan?.planName || "N/A"}</td>
                    <td>${subscription.startDate || "N/A"}</td>
                    <td>${subscription.endDate || "N/A"}</td>
                    <td>
                        <span class="status ${statusClass}">
                            ${status}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        console.error("Subscription error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    Unable to load subscriptions.
                </td>
            </tr>
        `;
    }
}

// Load dashboard data
loadDashboard();
loadSubscriptions();