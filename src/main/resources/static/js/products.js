
const PRODUCT_API = "/api/products";

let products = [];

// Format prices in Indian Rupees
function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount || 0);
}

// Escape text before inserting it into HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Fetch products
async function loadProducts() {
    try {
        const response = await fetch(PRODUCT_API);

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        products = await response.json();
        displayProducts(products);

    } catch (error) {
        console.error(error);

        document.getElementById("productTable").innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    Unable to load products.
                </td>
            </tr>
        `;
    }
}

// Display products
function displayProducts(data) {

    document.getElementById("productCount").textContent =
        products.length;

    const table = document.getElementById("productTable");

    if (data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No products found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = data.map(product => `
        <tr>
            <td>#${product.id}</td>
            <td>${escapeHTML(product.name)}</td>
            <td>${escapeHTML(product.type || "-")}</td>
            <td class="price-value">
                ${formatPrice(product.salesPrice)}
            </td>
            <td>${formatPrice(product.costPrice)}</td>
            <td class="notes-cell" title="${escapeHTML(product.notes)}">
                ${escapeHTML(product.notes || "-")}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="edit-button"
                        onclick="editProduct(${product.id})">
                        Edit
                    </button>

                    <button class="delete-button"
                        onclick="deleteProduct(${product.id})">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// Search products
function searchProducts() {

    const search = document.getElementById("productSearch")
        .value.toLowerCase();

    const filtered = products.filter(product =>
        [
            product.name,
            product.type,
            product.notes
        ].some(value =>
            String(value || "").toLowerCase().includes(search)
        )
    );

    displayProducts(filtered);
}

// Open add product modal
function openProductModal() {

    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";

    document.getElementById("modalTitle").textContent = "Add Product";
    document.getElementById("saveButton").textContent = "Save Product";

    document.getElementById("productModal").classList.add("show");
}

// Close modal
function closeProductModal() {
    document.getElementById("productModal").classList.remove("show");
}

// Edit product
function editProduct(id) {

    const product = products.find(p => p.id === id);

    if (!product) {
        alert("Product not found");
        return;
    }

    document.getElementById("productId").value = product.id;
    document.getElementById("name").value = product.name || "";
    document.getElementById("type").value = product.type || "";
    document.getElementById("salesPrice").value = product.salesPrice ?? "";
    document.getElementById("costPrice").value = product.costPrice ?? "";
    document.getElementById("notes").value = product.notes || "";

    document.getElementById("modalTitle").textContent = "Edit Product";
    document.getElementById("saveButton").textContent = "Update Product";

    document.getElementById("productModal").classList.add("show");
}

// Add or update product
document.getElementById("productForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const id = document.getElementById("productId").value;

        const product = {
            name: document.getElementById("name").value.trim(),
            type: document.getElementById("type").value,
            salesPrice: Number(document.getElementById("salesPrice").value),
            costPrice: document.getElementById("costPrice").value === ""
                ? null
                : Number(document.getElementById("costPrice").value),
            notes: document.getElementById("notes").value.trim()
        };

        if (!product.name || !Number.isFinite(product.salesPrice)
            || product.salesPrice <= 0) {
            alert("Enter a product name and a valid sales price.");
            return;
        }

        if (product.costPrice !== null &&
            (!Number.isFinite(product.costPrice) || product.costPrice < 0)) {
            alert("Enter a valid cost price.");
            return;
        }

        const button = document.getElementById("saveButton");
        button.disabled = true;
        button.textContent = "Saving...";

        try {

            const response = await fetch(
                id ? `${PRODUCT_API}/${id}` : PRODUCT_API,
                {
                    method: id ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(product)
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to save product");
            }

            closeProductModal();
            await loadProducts();

            alert(id ? "Product updated successfully!" :
                "Product added successfully!");

        } catch (error) {
            alert(error.message);
        } finally {
            button.disabled = false;
            button.textContent = id ? "Update Product" : "Save Product";
        }
    });

// Delete product
async function deleteProduct(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(`${PRODUCT_API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(
                "Unable to delete product. It may be linked to an existing subscription."
            );
        }

        await loadProducts();
        alert("Product deleted successfully!");

    } catch (error) {
        alert(error.message);
    }
}

// Load products when page opens
loadProducts();
