
const PLAN_API = "/api/plans";

let plans = [];

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount || 0);
}

// Fetch plans
async function loadPlans() {
    try {
        const response = await fetch(PLAN_API);

        if (!response.ok) {
            throw new Error("Failed to load plans");
        }

        plans = await response.json();
        displayPlans(plans);

    } catch (error) {
        console.error(error);

        document.getElementById("planTable").innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    Unable to load plans.
                </td>
            </tr>
        `;
    }
}

// Display plans
function displayPlans(data) {

    document.getElementById("planCount").textContent = plans.length;

    const table = document.getElementById("planTable");

    if (data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    No plans found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = data.map(plan => {

        const active = plan.active === true;

        return `
            <tr>
                <td>#${plan.id}</td>
                <td>${escapeHTML(plan.planName)}</td>
                <td>${escapeHTML(plan.description || "-")}</td>
                <td class="plan-price">
                    ${formatPrice(plan.price)}
                </td>
                <td>${escapeHTML(plan.billingCycle)}</td>
                <td>${plan.durationDays} days</td>
                <td>
                    <span class="plan-status ${
                        active ? "plan-active" : "plan-inactive"
                    }">
                        ${active ? "ACTIVE" : "INACTIVE"}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-button"
                            onclick="editPlan(${plan.id})">
                            Edit
                        </button>

                        <button class="delete-button"
                            onclick="deletePlan(${plan.id})">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// Search plans
function searchPlans() {

    const search = document.getElementById("planSearch")
        .value.toLowerCase();

    const filtered = plans.filter(plan =>
        [
            plan.planName,
            plan.description,
            plan.billingCycle
        ].some(value =>
            String(value || "").toLowerCase().includes(search)
        )
    );

    displayPlans(filtered);
}

// Automatically suggest duration based on billing cycle
document.getElementById("billingCycle").addEventListener("change", function() {

    const durations = {
        DAILY: 1,
        WEEKLY: 7,
        MONTHLY: 30,
        YEARLY: 365
    };

    document.getElementById("durationDays").value =
        durations[this.value] || "";
});

// Open create plan modal
function openPlanModal() {

    document.getElementById("planForm").reset();
    document.getElementById("planId").value = "";

    document.getElementById("modalTitle").textContent = "Create Plan";
    document.getElementById("saveButton").textContent = "Save Plan";

    document.getElementById("planModal").classList.add("show");
}

// Close modal
function closePlanModal() {
    document.getElementById("planModal").classList.remove("show");
}

// Edit plan
function editPlan(id) {

    const plan = plans.find(p => p.id === id);

    if (!plan) {
        alert("Plan not found");
        return;
    }

    document.getElementById("planId").value = plan.id;
    document.getElementById("planName").value = plan.planName || "";
    document.getElementById("description").value = plan.description || "";
    document.getElementById("price").value = plan.price ?? "";
    document.getElementById("billingCycle").value = plan.billingCycle || "";
    document.getElementById("durationDays").value = plan.durationDays ?? "";
    document.getElementById("active").value = String(plan.active);

    document.getElementById("modalTitle").textContent = "Edit Plan";
    document.getElementById("saveButton").textContent = "Update Plan";

    document.getElementById("planModal").classList.add("show");
}

// Add or update plan
document.getElementById("planForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const id = document.getElementById("planId").value;

        const plan = {
            planName: document.getElementById("planName").value.trim(),
            description: document.getElementById("description").value.trim(),
            price: Number(document.getElementById("price").value),
            billingCycle: document.getElementById("billingCycle").value,
            durationDays: Number(document.getElementById("durationDays").value),
            active: document.getElementById("active").value === "true"
        };

        if (!plan.planName || !plan.billingCycle ||
            !Number.isFinite(plan.price) || plan.price <= 0 ||
            !Number.isInteger(plan.durationDays) || plan.durationDays <= 0) {
            alert("Please enter valid plan details.");
            return;
        }

        const button = document.getElementById("saveButton");
        button.disabled = true;
        button.textContent = "Saving...";

        try {

            const response = await fetch(
                id ? `${PLAN_API}/${id}` : PLAN_API,
                {
                    method: id ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(plan)
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to save plan");
            }

            closePlanModal();
            await loadPlans();

            alert(id ? "Plan updated successfully!" :
                "Plan created successfully!");

        } catch (error) {
            alert(error.message);
        } finally {
            button.disabled = false;
            button.textContent = id ? "Update Plan" : "Save Plan";
        }
    });

// Delete plan
async function deletePlan(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this plan?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(`${PLAN_API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(
                "Unable to delete plan. It may be linked to an existing subscription."
            );
        }

        await loadPlans();
        alert("Plan deleted successfully!");

    } catch (error) {
        alert(error.message);
    }
}

// Load plans when page opens
loadPlans();
