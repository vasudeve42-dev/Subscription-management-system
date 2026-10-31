
const CUSTOMER_API = "/api/customers";

let customers = [];

// Escape user-provided values before inserting them into HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Fetch customers from the backend
async function loadCustomers() {
    try {
        const response = await fetch(CUSTOMER_API);

        if (!response.ok) {
            throw new Error("Failed to load customers");
        }

        customers = await response.json();

        displayCustomers(customers);

    } catch (error) {
        console.error(error);

        document.getElementById("customerTable").innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    Unable to load customers.
                </td>
            </tr>
        `;
    }
}

// Display customers in the table
function displayCustomers(data) {

    document.getElementById("customerCount").textContent =
        customers.length;

    const table = document.getElementById("customerTable");

    if (data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No customers found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = data.map(customer => `
        <tr>
            <td>#${customer.id}</td>
            <td>${escapeHTML(customer.name)}</td>
            <td>${escapeHTML(customer.email)}</td>
            <td>${escapeHTML(customer.phone || "-")}</td>
            <td>${escapeHTML(customer.companyName || "-")}</td>
            <td>${escapeHTML(customer.address || "-")}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-button"
                        onclick="editCustomer(${customer.id})">
                        Edit
                    </button>

                    <button class="delete-button"
                        onclick="deleteCustomer(${customer.id})">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// Search customers
function searchCustomers() {

    const search = document.getElementById("customerSearch")
        .value.toLowerCase();

    const filtered = customers.filter(customer =>
        [
            customer.name,
            customer.email,
            customer.phone,
            customer.companyName
        ].some(value => String(value || "").toLowerCase().includes(search))
    );

    displayCustomers(filtered);
}

// Open add customer modal
function openCustomerModal() {

    document.getElementById("customerForm").reset();
    document.getElementById("customerId").value = "";

    document.getElementById("modalTitle").textContent = "Add Customer";
    document.getElementById("saveButton").textContent = "Save Customer";

    document.getElementById("customerModal").classList.add("show");
}

// Close modal
function closeCustomerModal() {
    document.getElementById("customerModal").classList.remove("show");
}

// Load customer details into the form for editing
function editCustomer(id) {

    const customer = customers.find(c => c.id === id);

    if (!customer) {
        alert("Customer not found");
        return;
    }

    document.getElementById("customerId").value = customer.id;
    document.getElementById("name").value = customer.name || "";
    document.getElementById("email").value = customer.email || "";
    document.getElementById("phone").value = customer.phone || "";
    document.getElementById("companyName").value = customer.companyName || "";
    document.getElementById("address").value = customer.address || "";

    document.getElementById("modalTitle").textContent = "Edit Customer";
    document.getElementById("saveButton").textContent = "Update Customer";

    document.getElementById("customerModal").classList.add("show");
}

// Add or update customer
document.getElementById("customerForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const id = document.getElementById("customerId").value;

        const customer = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            companyName: document.getElementById("companyName").value.trim(),
            address: document.getElementById("address").value.trim()
        };

        if (!customer.name || !customer.email) {
            alert("Name and email are required.");
            return;
        }

        const button = document.getElementById("saveButton");
        button.disabled = true;
        button.textContent = "Saving...";

        try {

            const response = await fetch(
                id ? `${CUSTOMER_API}/${id}` : CUSTOMER_API,
                {
                    method: id ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(customer)
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to save customer");
            }

            closeCustomerModal();
            await loadCustomers();

            alert(id ? "Customer updated successfully!" :
                "Customer added successfully!");

        } catch (error) {
            alert(error.message);
        } finally {
            button.disabled = false;
            button.textContent = id ? "Update Customer" : "Save Customer";
        }
    });

// Delete customer
async function deleteCustomer(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(`${CUSTOMER_API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(
                "Unable to delete customer. They may have existing subscriptions."
            );
        }

        await loadCustomers();
        alert("Customer deleted successfully!");

    } catch (error) {
        alert(error.message);
    }
}

// Load customers when page opens
loadCustomers();
